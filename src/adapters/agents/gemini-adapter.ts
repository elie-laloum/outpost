import { invariant } from "../../domain/errors.ts";
import { authenticationCommand } from "./authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { geminiEvents } from "./gemini-events.ts";
import { geminiRequest } from "./gemini-request.ts";
import type { GeminiSettings } from "./gemini.types.ts";

function bindGemini(settings: GeminiSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "gemini",
    authenticate: authenticationCommand("gemini", settings.authentication),
    bootstrap: "gemini",
    resumable: false,
    capture: false,
    requiresFinishedEvent: true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => geminiRequest(settings, input),
    events: geminiEvents,
  } satisfies AgentAdapter);
}

export const gemini = Object.freeze({
  harness(settings: Omit<GeminiSettings, "model"> = {}): CliHarness {
    invariant(
      settings && typeof settings === "object" && !("model" in settings),
      "Set the model on agent(), not on its harness",
    );
    const configured = Object.freeze({
      ...settings,
      variables: Object.freeze({ ...settings.variables }),
    });
    return Object.freeze({
      kind: "cli",
      bind: (model?: string) =>
        bindGemini({
          ...configured,
          ...(model === undefined ? {} : { model }),
        }),
    });
  },
});
