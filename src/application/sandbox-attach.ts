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
  const { options, provider, workspace, sync, stop } = context;
  const { selectAgent, restore } = agents;
  const signal = settings.signal
    ? AbortSignal.any([settings.signal, stop.signal])
    : stop.signal;
  const { selected, adapter, executionLease } = await selectAgent(
    settings.agent ?? options.agent,
    signal,
  );
  if (settings.continuation) await restore(settings.continuation.id, selected);
  const brief = await completeBrief(settings.brief, signal, settings.ask);
  const text = brief
    ? await renderBrief(
        brief,
        workspace,
        executionLease,
        provider.placement === "host",
        settings,
      )
    : undefined;
  const command = adapter.request({
    interactive: true,
    ...(text === undefined ? {} : { text }),
    ...(settings.continuation ? { continuation: settings.continuation } : {}),
  });
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
