import { invariant, recordRecovery } from "../domain/errors.ts";
import { restoreTerminal } from "../infrastructure/terminal.ts";
import { authenticateAgent } from "./agent-authentication.ts";
import { configureAgent } from "./agent-configuration.ts";
import { restoreConversation } from "./agent-conversations.ts";
import { agentRequest } from "./agent-request.ts";
import { storageFor } from "./agent-storage.ts";
import { renderBrief } from "./brief-renderer.ts";
import { openCliHooks } from "./cli-hooks.ts";
import { executionDefaults } from "./execution.constants.ts";
import { validateFileAgent } from "./file-agent-validation.ts";
import type { FileSandbox } from "./file-sandbox.types.ts";
import { completeBrief } from "./interactive-brief.ts";
export { validateFileAgent } from "./file-agent-validation.ts";

import type { FileSandboxAttachmentContext } from "./file-sandbox-context.types.ts";
export function createFileSandboxAttachment({
  options,
  workspace,
  state,
  lease,
  staging,
  conversationHome,
  signal,
  gate,
  settled,
  known,
}: FileSandboxAttachmentContext): FileSandbox["attach"] {
  return (settings = {}) => {
    return gate.run(async () => {
      const agent = settings.agent ?? options.agent;
      invariant(
        agent?.kind === "cli" && agent.fileWorkspaces?.interactive,
        "Interactive CLI support for file workspaces has not been validated",
      );
      const brief = await completeBrief(
        settings.brief,
        settings.signal,
        settings.ask,
      );
      if (brief)
        await validateFileAgent(agent, {
          brief,
          ...(settings.continuation
            ? { continuation: settings.continuation }
            : {}),
        });
      const variables = {
        ...options.sandboxProvider.variables,
        ...options.variables,
        ...agent.variables,
      };
      const credentials = await authenticateAgent(
        agent,
        variables,
        lease,
        options.sandboxProvider.placement,
        signal,
      );
      await configureAgent(
        agent,
        variables,
        lease,
        options.sandboxProvider.placement,
        signal,
      );
      if (settings.continuation && !known.has(settings.continuation.id)) {
        const storage = storageFor(agent);
        invariant(storage, "Agent does not support conversation restoration");
        await restoreConversation(storage, settings.continuation.id, {
          repository: workspace.runtime.directory,
          runtimeDirectory: workspace.runtime.directory,
          home: conversationHome,
          staging,
          sandbox: lease,
          local: options.sandboxProvider.placement === "host",
        });
      }
      const prompt = brief
        ? await renderBrief(
            brief,
            {
              directory: workspace.directory,
              projectDirectory: workspace.runtime.directory,
            },
            lease,
            options.sandboxProvider.placement === "host",
            settings,
          )
        : undefined;
      const command = await agentRequest(
        agent,
        {
          interactive: true,
          ...(prompt === undefined ? {} : { text: prompt }),
          ...(settings.continuation
            ? { continuation: settings.continuation }
            : {}),
        },
        lease.invoke,
      );
      const hookStop = new AbortController();
      const hookSignal = AbortSignal.any([
        hookStop.signal,
        signal,
        ...(settings.signal ? [settings.signal] : []),
      ]);
      const hooks = agent.hooks?.handlers.length
        ? await openCliHooks(agent.hooks, lease, hookSignal, (error) =>
            hookStop.abort(error),
          )
        : undefined;
      let hookFailure: unknown;
      try {
        const output = await settled(
          () =>
            lease.invoke({
              ...(hooks
                ? hooks.command({
                    ...command,
                    variables: {
                      ...variables,
                      ...credentials,
                      ...command.variables,
                    },
                  })
                : {
                    ...command,
                    variables: {
                      ...variables,
                      ...credentials,
                      ...command.variables,
                    },
                  }),
              signal: hookSignal,
              deadlineMs: executionDefaults.attachMs,
              ...(settings.terminal ? { terminal: settings.terminal } : {}),
            }),
          settings.signal,
        );
        hookSignal.throwIfAborted();
        return {
          ...output,
          workspaceInfo: state.record,
          directory: workspace.directory,
        };
      } catch (error) {
        hookFailure = error;
        throw error;
      } finally {
        restoreTerminal();
        try {
          await hooks?.close();
        } catch (error) {
          if (hookFailure)
            recordRecovery(hookFailure, { hookCleanupError: error });
          else throw error;
        }
      }
    });
  };
}
