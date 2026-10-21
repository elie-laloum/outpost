import { invariant, recordRecovery } from "../domain/errors.ts";
import { restoreTerminal } from "../infrastructure/terminal.ts";
import { agentRequest } from "./agent-request.ts";
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
  signal,
  gate,
  settlement,
  agents,
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
      const { executionLease } = await agents.prepare(agent, signal);
      if (settings.continuation)
        await agents.restore(settings.continuation.id, agent, executionLease);
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
        const output = await settlement.settled(
          () =>
            executionLease.invoke({
              ...(hooks ? hooks.command(command) : command),
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
