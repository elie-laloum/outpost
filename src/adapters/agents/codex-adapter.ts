import { textMatcher } from "./text-matcher.ts";
import { codexQuotaPatterns } from "./quota.constants.ts";
import {
  codexUnavailablePatterns,
  transientNoticePatterns,
} from "./unavailable.constants.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { codexCredentials } from "./codex-authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { codexProvider } from "./codex-provider.ts";
import { codexEvents } from "./codex-events.ts";
import { codexRequest } from "./codex-request.ts";
import { codexModelSupport } from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound, CodexSettings } from "./settings.types.ts";

function bindCodex(settings: Bound<CodexSettings>): AgentAdapter {
  supportModel(codexModelSupport, settings.model);
  codexProvider(settings);
  const credentials = credentialPlanner(
    "Codex",
    codexCredentials(settings.modelProvider),
    settings.authentication,
    settings.model,
  );
  return Object.freeze({
    name: "codex",
    ...(credentials ? { credentials } : {}),
    conversations: "codex",
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => codexRequest(settings, input),
    events: codexEvents,
    quota: textMatcher(codexQuotaPatterns),
    unavailable: textMatcher(codexUnavailablePatterns, transientNoticePatterns),
  } satisfies AgentAdapter);
}

export function codexHarness(settings: CodexSettings = {}): CliHarness {
  harnessSettings(settings);
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindCodex({ ...configured, ...(model === undefined ? {} : { model }) }),
  });
}
