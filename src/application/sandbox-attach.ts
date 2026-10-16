import { agentRequest } from "./agent-request.ts";
import { openCliHooks } from "./cli-hooks.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import type { CommandResult } from "../domain/command.types.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { restoreTerminal } from "../infrastructure/terminal.ts";
import { renderBrief } from "./brief-renderer.ts";
import { executionDefaults } from "./execution.constants.ts";
import { completeBrief } from "./interactive-brief.ts";
import type { AttachOptions, AttachResult } from "./outpost.types.ts";
import type {
  ProvisionedSandbox,
  SandboxAgents,
} from "./sandbox-session.types.ts";

export async function attachInSandbox(
  context: ProvisionedSandbox,
  agents: SandboxAgents,
  settings: AttachOptions,
): Promise<AttachResult> {
  const { options, sandboxProvider, workspace, sync, stop } = context;
  const chosen = settings.agent ?? options.agent;
  invariant(
    chosen?.kind !== "fallback",
    "Interactive attachment requires a single agent; fallback agents only apply to dispatch",
  );
  invariant(
    chosen?.kind === "cli",
    "This harness does not support interactive attachment",
  );
  invariant(
    !settings.continuation || chosen.resumable !== false,
    "This adapter does not support continuation",
  );
  invariant(
    !settings.continuation?.fork || chosen.forkable !== false,
    "This adapter does not support automated fork",
  );
  const { selectAgent, restore } = agents;
  const hookStop = new AbortController();
  const signal = AbortSignal.any([
    hookStop.signal,
    stop.signal,
    ...(settings.signal ? [settings.signal] : []),
  ]);
  await context.readyHooks(signal);
  const { selected, adapter, executionLease } = await selectAgent(
    chosen,
    signal,
  );
  if (settings.continuation)
    await restore(settings.continuation.id, selected, executionLease);
  const brief = await completeBrief(settings.brief, signal, settings.ask);
  const text = brief
    ? await renderBrief(
        brief,
        workspace,
        executionLease,
        sandboxProvider.placement === "host",
        settings,
      )
    : undefined;
  invariant(
    adapter.kind === "cli",
    "This harness does not support interactive attachment",
  );
  const command = await agentRequest(
    adapter,
    {
      interactive: true,
      ...(text === undefined ? {} : { text }),
      ...(settings.continuation ? { continuation: settings.continuation } : {}),
    },
    (command) =>
      executionLease.invoke({
        ...command,
        signal,
        deadlineMs: executionDefaults.attachMs,
      }),
  );
  const baseline = (
    await git(workspace.directory, ["rev-parse", "HEAD"])
  ).trim();
  let output: CommandResult;
  const hooks = adapter.hooks?.handlers.length
    ? await openCliHooks(adapter.hooks, executionLease, signal, (error) =>
        hookStop.abort(error),
      )
    : undefined;
  let failure: unknown;
  try {
    output = await executionLease.invoke({
      ...(hooks ? hooks.command(command) : command),
      ...(settings.terminal ? { terminal: settings.terminal } : {}),
      deadlineMs: executionDefaults.attachMs,
      signal,
    });
    signal.throwIfAborted();
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    restoreTerminal();
    let cleanupFailure: unknown;
    try {
      await hooks?.close();
    } catch (error) {
      cleanupFailure = error;
    }
    try {
      await sync?.pull();
    } catch (error) {
      cleanupFailure ??= error;
    }
    if (cleanupFailure) {
      if (failure)
        recordRecovery(failure, { hookCleanupError: cleanupFailure });
      else throw cleanupFailure;
    }
  }
  if (output.status === 0) await context.state.lease.checkGuard();
  return {
    ...output,
    branch: workspace.branch,
    directory: workspace.directory,
    commits: await commits(
      workspace.directory,
      baseline,
      options.limits?.collectMs,
    ),
  };
}
