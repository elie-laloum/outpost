import { profileText } from "../profile-support.ts";
import { validId } from "../../../infrastructure/conversations/identity.ts";
import type { AgentInput } from "../../../domain/agent.types.ts";
import type { Command } from "../../../domain/command.types.ts";
import { invariant } from "../../../domain/errors.ts";
import { antigravityVariables } from "./antigravity.constants.ts";
import type { AntigravitySettings } from "./antigravity.types.ts";
import type { Bound } from "../settings.types.ts";

export function antigravityRequest(
  settings: Bound<AntigravitySettings>,
  input: AgentInput,
): Command {
  const text = profileText(settings.profile, input.text);
  invariant(
    !input.continuation?.fork,
    "Antigravity does not support automated fork in Outpost",
  );
  const args: string[] = [];
  if (input.continuation) {
    validId(input.continuation.id);
    args.push("--conversation", input.continuation.id);
  }
  if (settings.model) args.push("--model", settings.model.name);
  if (settings.mode) args.push("--mode", settings.mode);
  if (input.interactive)
    return {
      executable: "agy",
      variables: antigravityVariables,
      arguments: [
        ...args,
        ...(text === undefined ? [] : ["--prompt-interactive", text]),
      ],
      interactive: true,
    };
  if (!settings.mode) args.push("--dangerously-skip-permissions");
  args.push("--input-format", "stream-json", "--output-format", "stream-json");
  return {
    executable: "agy",
    variables: antigravityVariables,
    arguments: args,
    stdin: `${JSON.stringify({ event: "user", message: { content: text ?? "" } })}\n`,
  };
}
