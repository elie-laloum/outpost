import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { copilotCredentials } from "./copilot-authentication.ts";
import { copilotEvents } from "./copilot-events.ts";
import { copilotRequest } from "./copilot-request.ts";
import type { CopilotSettings } from "./copilot.types.ts";
import { copilotModelSupport } from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound } from "./settings.types.ts";

function bindCopilot(settings: Bound<CopilotSettings>): AgentAdapter {
  supportModel(copilotModelSupport, settings.model);
  const credentials = credentialPlanner(
    "GitHub Copilot CLI",
    copilotCredentials,
    settings.authentication,
    settings.model,
  );
  return Object.freeze({
    name: "copilot",
    ...(credentials ? { credentials } : {}),
    bootstrap: "copilot",
    resumable: false,
    capture: false,
    requiresFinishedEvent: true,
    variables: Object.freeze({
      COPILOT_AUTO_UPDATE: "false",
      ...settings.variables,
    }),
    request: (input) => copilotRequest(settings, input),
    events: copilotEvents,
  } satisfies AgentAdapter);
}

export function copilotHarness(settings: CopilotSettings = {}): CliHarness {
  harnessSettings(settings);
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindCopilot({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
