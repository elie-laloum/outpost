import { textMatcher } from "./text-matcher.ts";
import { antigravityQuotaPatterns } from "./quota.constants.ts";
import {
  antigravityUnavailablePatterns,
  transientNoticePatterns,
} from "./unavailable.constants.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { antigravityCredentials } from "./antigravity-authentication.ts";
import { antigravityVariables } from "./antigravity.constants.ts";
import { antigravityEvents } from "./antigravity-events.ts";
import { antigravityRequest } from "./antigravity-request.ts";
import type { AntigravitySettings } from "./antigravity.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { antigravityModelSupport } from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound } from "./settings.types.ts";

function bindAntigravity(settings: Bound<AntigravitySettings>): AgentAdapter {
  supportModel(antigravityModelSupport, settings.model);
  const credentials = credentialPlanner(
    "Antigravity",
    antigravityCredentials,
    settings.authentication,
    settings.model,
  );
  return Object.freeze({
    name: "antigravity",
    ...(credentials ? { credentials } : {}),
    bootstrap: "antigravity",
    resumable: true,
    forkable: false,
    capture: false,
    requiresFinishedEvent: true,
    variables: Object.freeze({
      ...antigravityVariables,
      ...settings.variables,
    }),
    request: (input) => antigravityRequest(settings, input),
    events: antigravityEvents,
    quota: textMatcher(antigravityQuotaPatterns),
    unavailable: textMatcher(
      antigravityUnavailablePatterns,
      transientNoticePatterns,
    ),
  } satisfies AgentAdapter);
}

export function antigravityHarness(
  settings: AntigravitySettings = {},
): CliHarness {
  harnessSettings(settings);
  invariant(
    !("conversations" in settings) || settings.conversations === undefined,
    "Antigravity has no portable conversation capture; conversations cannot be stored",
  );
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindAntigravity({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
