import { KIMI_PROMPT_MAX_BYTES } from "./kimi.constants.ts";
import { profileText } from "../profile-support.ts";
import { validId } from "../../../infrastructure/conversations/identity.ts";
import type { AgentInput } from "../../../domain/agent.types.ts";
import { authenticationForm } from "../../../domain/authentication.ts";
import type { Command } from "../../../domain/command.types.ts";
import { invariant } from "../../../domain/errors.ts";
import type { KimiSettings } from "./kimi.types.ts";
import type { Bound } from "../settings.types.ts";
import { kimiServerBridge } from "./kimi-server.constants.ts";

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
  const text = profileText(settings.profile, input.text);
  invariant(
    !input.continuation?.fork,
    "Kimi Code requires native fork preparation in Outpost",
  );
  invariant(
    Buffer.byteLength(text ?? "", "utf8") <= KIMI_PROMPT_MAX_BYTES,
    "Kimi Code prompts must not exceed 65536 UTF-8 bytes, including profile instructions",
  );
  const args = [...modelOption(settings)];
  if (input.continuation) validId(input.continuation.id);
  if (input.liveInput && !input.interactive)
    return {
      executable: "node",
      arguments: ["-e", kimiServerBridge],
      stdin: `${JSON.stringify({
        text: text ?? "",
        model: modelOption(settings)[1],
        session: input.continuation?.id,
      })}\n`,
    };
  if (input.continuation) {
    args.push("--session", input.continuation.id);
  }
  if (input.interactive) {
    invariant(
      text === undefined,
      "Kimi Code starts interactive sessions without an initial prompt",
    );
    return { executable: "kimi", arguments: args, interactive: true };
  }
  return {
    executable: "kimi",
    arguments: [
      ...args,
      "--prompt",
      text ?? "",
      "--output-format",
      "stream-json",
    ],
  };
}
