import { observedOperation } from "../domain/observed-operation.ts";
import type { WorkspaceCommitsEvent } from "../domain/replay.types.ts";
import { recordWorkspaceCommits } from "../infrastructure/git/replay-commits.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

export async function recordReplayChanges(
  dispatch: DispatchOptions<unknown>,
  directory: string,
  baseline: string,
  deadlineMs?: number,
): Promise<void> {
  const logging = dispatch.logging;
  if (!logging || logging === "stdout" || !logging.replayable) return;
  let event: WorkspaceCommitsEvent;
  try {
    event = await observedOperation(
      dispatch.observation,
      "git",
      "commits.record",
      () => recordWorkspaceCommits(directory, baseline, deadlineMs),
    );
  } catch (error) {
    event = {
      kind: "workspace-commits",
      unavailable: `Workspace commits could not be recorded: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  if ("unavailable" in event)
    notify(
      dispatch.warn,
      `Replay recording is incomplete: ${event.unavailable}`,
    );
  dispatch.observation?.emit("git", event);
}
