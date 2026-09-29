import type { Agent } from "../domain/agent.types.ts";
import { mainLoopSteering, steeringInbox } from "../domain/steering.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { notify } from "./observation.ts";
import { deliverSteering, rejectSubagentSteering } from "./steering-scope.ts";
import type { SteeringTurnInput } from "./steering-turns.types.ts";

/** Runs one pass, resuming the conversation while steering messages remain. */
export async function steeringTurns(
  agent: Agent,
  options: DispatchOptions<unknown>,
  prompt: string,
  continuation: DispatchOptions["continuation"],
  pass: number,
  run: (
    prompt: string,
    continuation: DispatchOptions["continuation"],
  ) => Promise<Turn>,
): Promise<Turn[]> {
  const inbox = steeringInbox(options.steering);
  const turns: Turn[] = [];
  let next: SteeringTurnInput = { prompt, continuation, mode: "injected" };
  for (;;) {
    if (agent.kind !== "custom") rejectSubagentSteering(inbox);
    const messages = inbox?.take(mainLoopSteering) ?? [];
    deliverSteering(messages, next.mode, pass, options.observe);
    const text = [next.prompt, ...messages.map((message) => message.text)]
      .filter(Boolean)
      .join("\n\n");
    const turn = await run(text, next.continuation);
    turns.push(turn);
    const recorded = agent.kind === "replay" ? agent.pendingSteering() : [];
    if (recorded?.length) {
      for (const instruction of recorded)
        notify(options.observe, {
          kind: "steer",
          text: instruction,
          mode: "resumed",
          pass,
          at: new Date().toISOString(),
        });
      next = {
        prompt: recorded.join("\n\n"),
        continuation: turn.conversation ? { id: turn.conversation } : undefined,
        mode: "resumed",
      };
      continue;
    }
    if (
      !inbox?.count(mainLoopSteering) ||
      !turn.conversation ||
      agent.resumable === false
    )
      return turns;
    next = {
      prompt: "",
      continuation: { id: turn.conversation },
      mode: "resumed",
    };
  }
}
