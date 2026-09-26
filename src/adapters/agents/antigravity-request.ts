import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { AntigravitySettings } from "./antigravity.types.ts";
import type { Bound } from "./settings.types.ts";

export function antigravityRequest(
  settings: Bound<AntigravitySettings>,
  input: AgentInput,
): Command {
  invariant(
    !input.continuation,
    "Antigravity does not support continuation or fork in Outpost",
  );
  const args: string[] = [];
  if (settings.model) args.push("--model", settings.model.name);
  if (settings.mode) args.push("--mode", settings.mode);
  if (input.interactive)
    return {
      executable: "agy",
      arguments: [
        ...args,
        ...(input.text === undefined
          ? []
          : ["--prompt-interactive", input.text]),
      ],
      interactive: true,
    };
  if (!settings.mode) args.push("--dangerously-skip-permissions");
  args.push("--input-format", "stream-json", "--output-format", "stream-json");
  return {
    executable: "agy",
    arguments: args,
    stdin: `${JSON.stringify({ event: "user", message: { content: input.text ?? "" } })}\n`,
  };
}
