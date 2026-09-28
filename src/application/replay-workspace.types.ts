import type { ReplayDivergenceDetails } from "../domain/replay.types.ts";

export interface ReplayWorkspaceContext {
  readonly signal?: AbortSignal;
  readonly deadlineMs: number;
  diverge(
    details: Omit<ReplayDivergenceDetails, "turn">,
    fatal?: boolean,
  ): void;
}
