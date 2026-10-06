import type { Usage } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { ReplayDivergence } from "../domain/replay.ts";
import type {
  ReplayAgent,
  ReplayDivergenceDetails,
} from "../domain/replay.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { addUsage } from "../domain/usage.ts";
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
  const next = () => {
    const turn = agent.nextTurn();
    if (!turn)
      throw new ReplayDivergence({
        kind: "exhausted",
        turn: agent.turns.length + 1,
      });
    return turn;
  };
  let recorded = next();
  let number = agent.turns.length - agent.remainingTurns;
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
  let handedOver: Usage = { input: 0, cached: 0, output: 0 };
  for (;;) {
    const decisions = recorded.decisionEvents ?? [];
    let position = 0;
    const emitDecisions = (before: number) => {
      while (decisions[position]?.before === before) {
        options.signal?.throwIfAborted();
        const decision = decisions[position++]!;
        if (decision.event.kind !== "decision" && !options.observation?.verbose)
          continue;
        options.observation
          ?.child({
            pass,
            ...(decision.subagentId ? { subagentId: decision.subagentId } : {}),
          })
          .emit("decision", decision.event);
      }
    };
    for (const [index, event] of recorded.events.entries()) {
      emitDecisions(index);
      options.signal?.throwIfAborted();
      notify(options.observe, { ...event, pass, at: new Date().toISOString() });
    }
    emitDecisions(recorded.events.length);
    if (recorded.changes)
      await replayWorkspace(lease, recorded.changes, {
        ...(options.signal ? { signal: options.signal } : {}),
        deadlineMs: options.deadlineMs ?? executionDefaults.deadlineMs,
        diverge,
      });
    options.signal?.throwIfAborted();
    if (!recorded.handover) break;
    handedOver = addUsage(handedOver, recorded.usage);
    notify(options.observe, {
      ...recorded.handover,
      pass,
      at: new Date().toISOString(),
    });
    // The next candidate restarted from the original brief, which this replayed turn may not carry.
    recorded = next();
    number = agent.turns.length - agent.remainingTurns;
  }
  if (recorded.failure)
    throw new OutpostError(recorded.failure.code, recorded.failure.message, {
      replayed: true,
    });
  return {
    text: recorded.text,
    usage: addUsage(handedOver, recorded.usage),
    status: 0,
    durationMs: Date.now() - start,
    ...(recorded.interrupted ? { interrupted: "steering" as const } : {}),
    ...(recorded.conversation ? { conversation: recorded.conversation } : {}),
  };
}
