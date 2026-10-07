import { randomUUID } from "node:crypto";
import type {
  AgentEvent,
  CliAgent,
  CliHarness,
} from "../../domain/agent.types.ts";
import { invariant, OutpostError } from "../../domain/errors.ts";
import { scriptedExecutable } from "../../infrastructure/scripted-turn.constants.ts";
import { readScriptedRecipe } from "../../infrastructure/scripted-turn.ts";
import type { ScriptedAgentOptions } from "./scripted-agent.types.ts";

export function scriptedAgent(options: ScriptedAgentOptions): CliAgent {
  invariant(
    options.turns.length > 0,
    "Scripted agents require at least one turn",
  );
  invariant(
    options.name === undefined || options.name.trim().length > 0,
    "Scripted agent name cannot be empty",
  );
  const conversation = randomUUID();
  const decoded = new Map<string, AgentEvent>();
  const recipes = options.turns.map((turn) => {
    const events: AgentEvent[] = [
      { kind: "conversation", id: conversation },
      ...structuredClone(turn.events ?? []),
    ];
    invariant(
      !turn.events?.some((event) => event.kind === "conversation"),
      "Scripted agents own their conversation identifier",
    );
    if (turn.text !== undefined) events.push({ kind: "text", text: turn.text });
    if (turn.usage || !events.some((event) => event.kind === "usage")) {
      invariant(
        !turn.usage || !events.some((event) => event.kind === "usage"),
        "Declare usage in either events or usage",
      );
      events.push({
        kind: "usage",
        tokens: { input: 0, cached: 0, output: 0, ...turn.usage },
      });
    }
    if (!events.some((event) => event.kind === "finished"))
      events.push({ kind: "finished" });
    const lines = events.map((event) => {
      const line = JSON.stringify(event);
      decoded.set(line, event);
      return line;
    });
    const text = JSON.stringify({
      events: lines,
      status: turn.status ?? 0,
      stderr: turn.stderr ?? "",
      ...(turn.commit ? { commit: turn.commit } : {}),
    });
    readScriptedRecipe(text);
    return text;
  });
  let next = 0;
  const harness: CliHarness = { kind: "cli", bind: () => adapter };
  const adapter: CliAgent = {
    kind: "cli",
    harness,
    name: options.name ?? "scripted",
    usage: "events",
    capture: false,
    resumable: true,
    forkable: false,
    requiresFinishedEvent: true,
    request(input) {
      invariant(
        !input.interactive && !input.liveInput && !input.continuation?.fork,
        "Scripted agents do not support terminals, live input or fork",
      );
      invariant(
        !input.continuation || input.continuation.id === conversation,
        "Unknown scripted conversation",
      );
      const recipe = recipes[next++];
      if (recipe === undefined)
        throw new OutpostError("process", "Scripted agent turns exhausted");
      return {
        executable: scriptedExecutable,
        arguments: [recipe],
        stdin: input.text ?? "",
      };
    },
    events(line) {
      const event = decoded.get(line);
      invariant(event, "Unexpected scripted agent event");
      return [structuredClone(event)];
    },
  };
  return adapter;
}
