import { kimiUsage } from "./kimi-usage.ts";
import { sessionUsageCommand, sessionUsageResult } from "./session-usage.ts";
import { forkKimi } from "./kimi-fork.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { invariant } from "../../domain/errors.ts";
import { authenticationForm } from "../../domain/authentication.ts";
import { kimiRegions } from "./kimi.constants.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { kimiCredentials } from "./kimi-authentication.ts";
import { kimiEvents } from "./kimi-events.ts";
import { kimiRequest } from "./kimi-request.ts";
import type { KimiSettings } from "./kimi.types.ts";
import { kimiModelSupport } from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound } from "./settings.types.ts";

function bindKimi(settings: Bound<KimiSettings>): AgentAdapter {
  supportModel(kimiModelSupport, settings.model);
  const credentials = credentialPlanner(
    "Kimi Code",
    kimiCredentials(settings.region),
    settings.authentication,
    settings.model,
  );
  return Object.freeze({
    name: "kimi",
    ...(credentials ? { credentials } : {}),
    bootstrap: "kimi",
    resumable: true,
    forkable: true,
    fork: forkKimi,
    conversations: "kimi",
    variables: Object.freeze({
      KIMI_CODE_NO_AUTO_UPDATE: "1",
      ...settings.variables,
    }),
    request: (input) => kimiRequest(settings, input),
    events: kimiEvents,
    usage: "session",
    usageCommand: (conversation) => sessionUsageCommand("kimi", conversation),
    usageResult: (text) => sessionUsageResult(text, kimiUsage),
  } satisfies AgentAdapter);
}

export function kimiHarness(settings: KimiSettings = {}): CliHarness {
  harnessSettings(settings);
  invariant(
    settings.region === undefined ||
      Object.hasOwn(kimiRegions, settings.region),
    'Kimi region must be "mainland-cn" or "global"',
  );
  invariant(
    settings.region === undefined ||
      settings.authentication === undefined ||
      !authenticationForm(settings.authentication).form.startsWith("usage"),
    "Kimi region selects account authentication; configure the API endpoint through variables for usage authentication",
  );
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindKimi({ ...configured, ...(model === undefined ? {} : { model }) }),
  });
}
