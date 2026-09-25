import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { codexProvider } from "./codex-provider.ts";
import { validateContinuation } from "./continuation.ts";
import type { Bound, CodexSettings } from "./settings.types.ts";

export function codexRequest(
  settings: Bound<CodexSettings>,
  input: AgentInput,
): Command {
  validateContinuation(input);
  const args: string[] = [...codexProvider(settings)];
  if (settings.approvalReviewer === "auto_review")
    args.push(
      "-a",
      "on-request",
      "-s",
      "danger-full-access",
      "-c",
      'approvals_reviewer="auto_review"',
    );
  if (settings.approvalReviewer !== "auto_review" && !input.interactive)
    args.push("--dangerously-bypass-approvals-and-sandbox");
  if (settings.model) args.push("--model", settings.model.name);
  if (settings.model?.reasoning)
    args.push("-c", `model_reasoning_effort="${settings.model.reasoning}"`);
  if (!input.interactive) args.push("exec");
  if (input.continuation)
    args.push(
      input.continuation.fork ? "fork" : "resume",
      input.continuation.id,
    );
  if (!input.interactive) args.push("--json", "-");
  if (input.interactive && input.text !== undefined)
    args.push("--", input.text);
  return {
    executable: "codex",
    arguments: args,
    ...(input.interactive
      ? { interactive: true }
      : { stdin: input.text ?? "" }),
  };
}
