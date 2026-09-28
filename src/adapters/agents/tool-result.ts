import type { AgentEvent } from "../../domain/agent.types.ts";
import { observationDefaults } from "../../domain/observation.constants.ts";

export function toolResult(
  callId: unknown,
  name: unknown,
  value: unknown,
  isError = false,
): AgentEvent[] {
  if (typeof callId !== "string" || !callId) return [];
  const content =
    typeof value === "string" ? value : (JSON.stringify(value) ?? "");
  return [
    {
      kind: "tool-result",
      callId,
      name: typeof name === "string" ? name : "",
      isError,
      preview: content.slice(0, observationDefaults.previewCharacters),
      characters: content.length,
    },
  ];
}
