import { validId } from "../../../infrastructure/conversations/identity.ts";
import type { AgentInput } from "../../../domain/agent.types.ts";
import { authenticationForm } from "../../../domain/authentication.ts";
import type { Command } from "../../../domain/command.types.ts";
import { invariant } from "../../../domain/errors.ts";
import type { KimiSettings } from "./kimi.types.ts";
import type { Bound } from "../settings.types.ts";

function modelOption(settings: Bound<KimiSettings>): readonly string[] {
  if (!settings.model) return [];
  const usage =
    settings.authentication !== undefined &&
    authenticationForm(settings.authentication).form.startsWith("usage");
  return usage ? [] : ["--model", settings.model.name];
}

export function kimiRequest(
  settings: Bound<KimiSettings>,
  input: AgentInput,
): Command {
  invariant(
    !input.continuation?.fork,
    "Kimi Code requires native fork preparation in Outpost",
  );
  const args = [...modelOption(settings)];
  if (input.continuation) {
    validId(input.continuation.id);
    args.push("--session", input.continuation.id);
  }
  if (input.interactive) {
    invariant(
      input.text === undefined,
      "Kimi Code starts interactive sessions without an initial prompt",
    );
    return { executable: "kimi", arguments: args, interactive: true };
  }
  return {
    executable: "kimi",
    arguments: [
      ...args,
      "--prompt",
      input.text ?? "",
      "--output-format",
      "stream-json",
    ],
  };
}
