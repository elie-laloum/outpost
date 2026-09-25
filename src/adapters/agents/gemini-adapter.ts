import type { AgentModel } from "../../domain/model.types.ts";
import { authenticationCommand } from "./authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { geminiEvents } from "./gemini-events.ts";
import { geminiRequest } from "./gemini-request.ts";
import type { GeminiSettings } from "./gemini.types.ts";
import { geminiModelSupport } from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound } from "./settings.types.ts";

function bindGemini(settings: Bound<GeminiSettings>): AgentAdapter {
  supportModel(geminiModelSupport, settings.model);
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

export function geminiHarness(settings: GeminiSettings = {}): CliHarness {
  harnessSettings(settings);
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindGemini({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
