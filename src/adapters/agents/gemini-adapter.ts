import type { AgentAdapter } from "../../domain/agent.types.ts";
import { geminiEvents } from "./gemini-events.ts";
import { geminiRequest } from "./gemini-request.ts";
import type { GeminiSettings } from "./gemini.types.ts";

export function gemini(settings: GeminiSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "gemini",
    bootstrap: "gemini",
    resumable: false,
    capture: false,
    requiresFinishedEvent: true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => geminiRequest(settings, input),
    events: geminiEvents,
  } satisfies AgentAdapter);
}
