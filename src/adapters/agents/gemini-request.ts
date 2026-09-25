import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { GeminiSettings } from "./gemini.types.ts";

export function geminiRequest(
  settings: GeminiSettings,
  input: AgentInput,
): Command {
  invariant(
    !input.continuation,
    "Gemini does not support continuation or fork in Outpost",
  );
  const args: string[] = [];
  if (settings.model) args.push("--model", settings.model);
  const approvalMode =
    settings.approvalMode ?? (input.interactive ? "default" : "yolo");
  args.push("--approval-mode", approvalMode);
  if (!input.interactive && approvalMode === "yolo") args.push("--skip-trust");
  if (!input.interactive) args.push("--output-format", "stream-json");
  if (input.interactive && input.text !== undefined)
    args.push("--prompt-interactive", input.text);
  return {
    executable: "gemini",
    arguments: args,
    ...(input.interactive
      ? { interactive: true }
      : { stdin: input.text ?? "" }),
  };
}
