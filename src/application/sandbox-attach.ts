import { agentRequest } from "./agent-request.ts";
import { invariant } from "../domain/errors.ts";
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
  const signal = settings.signal
    ? AbortSignal.any([settings.signal, stop.signal])
    : stop.signal;
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
  try {
    output = await executionLease.invoke({
      ...command,
      ...(settings.terminal ? { terminal: settings.terminal } : {}),
      deadlineMs: executionDefaults.attachMs,
      signal: settings.signal
        ? AbortSignal.any([settings.signal, stop.signal])
        : stop.signal,
    });
  } finally {
    restoreTerminal();
    await sync?.pull();
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
