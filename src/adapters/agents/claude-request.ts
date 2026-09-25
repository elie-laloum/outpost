import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { validateContinuation } from "./continuation.ts";
import type { Bound, ClaudeSettings } from "./settings.types.ts";

export function claudeRequest(
  settings: Bound<ClaudeSettings>,
  input: AgentInput,
): Command {
  validateContinuation(input);
  const args: string[] = [];
  if (!input.interactive)
    args.push("--print", "--verbose", "--output-format", "stream-json");
  if (settings.model) args.push("--model", settings.model.name);
  if (settings.model?.reasoning)
    args.push("--effort", settings.model.reasoning);
  if (settings.permissions)
    args.push("--permission-mode", settings.permissions);
  if (!settings.permissions && !input.interactive)
    args.push("--dangerously-skip-permissions");
  if (input.continuation) {
    args.push("--resume", input.continuation.id);
    if (input.continuation.fork) args.push("--fork-session");
  }
  if (input.interactive && input.text !== undefined)
    args.push("--", input.text);
  return {
    executable: "claude",
    arguments: args,
    ...(input.interactive
      ? { interactive: true }
      : { stdin: input.text ?? "" }),
  };
}
