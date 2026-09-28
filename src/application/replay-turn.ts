import { OutpostError } from "../domain/errors.ts";
import { ReplayDivergence } from "../domain/replay.ts";
import type {
  ReplayAgent,
  ReplayDivergenceDetails,
} from "../domain/replay.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { notify } from "./observation.ts";
import { replayWorkspace } from "./replay-workspace.ts";

export async function replayTurn(
  lease: SandboxLease,
  agent: ReplayAgent,
  prompt: string,
  options: DispatchOptions<unknown>,
  pass: number,
): Promise<Turn> {
  const start = Date.now();
  options.signal?.throwIfAborted();
  const recorded = agent.nextTurn();
  if (!recorded)
    throw new ReplayDivergence({
      kind: "exhausted",
      turn: agent.turns.length + 1,
    });
  const number = agent.turns.length - agent.remainingTurns;
  const diverge = (
    details: Omit<ReplayDivergenceDetails, "turn">,
    fatal = false,
  ): void => {
    const divergence = new ReplayDivergence({ ...details, turn: number });
    if (fatal || agent.divergence === "fail") throw divergence;
    notify(options.warn, divergence.message);
  };
  if (recorded.prompt !== prompt)
    diverge({ kind: "prompt", expected: recorded.prompt, actual: prompt });
  for (const event of recorded.events) {
    options.signal?.throwIfAborted();
    notify(options.observe, { ...event, pass, at: new Date().toISOString() });
  }
  if (recorded.changes)
    await replayWorkspace(lease, recorded.changes, {
      ...(options.signal ? { signal: options.signal } : {}),
      deadlineMs: options.deadlineMs ?? executionDefaults.deadlineMs,
      diverge,
    });
  options.signal?.throwIfAborted();
  if (recorded.failure)
    throw new OutpostError(recorded.failure.code, recorded.failure.message, {
      replayed: true,
    });
  return {
    text: recorded.text,
    usage: recorded.usage,
    status: 0,
    durationMs: Date.now() - start,
    ...(recorded.conversation ? { conversation: recorded.conversation } : {}),
  };
}
