import { mcpConfigurationPlanner } from "./mcp-configuration.ts";
import { textMatcher } from "./text-matcher.ts";
import {
  conversationSettings,
  conversationStorage,
} from "./conversation-settings.ts";
import { codexQuotaPatterns } from "./quota.constants.ts";
import {
  codexUnavailablePatterns,
  transientNoticePatterns,
} from "./unavailable.constants.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { codexCredentials } from "./codex-authentication.ts";
import type {
  AgentAdapter,
  AgentInput,
  CliHarness,
} from "../../domain/agent.types.ts";
import { codexAppSession } from "./codex-app-session.ts";
import { codexProvider } from "./codex-provider.ts";
import { codexEvents } from "./codex-events.ts";
import { codexRequest } from "./codex-request.ts";
import { codexModelSupport } from "./model-support.constants.ts";
import {
  configuredSettings,
  harnessSettings,
  supportModel,
} from "./model-support.ts";
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
  const configuration = mcpConfigurationPlanner("Codex", settings.mcpServers);
  return Object.freeze({
    name: "codex",
    ...(credentials ? { credentials } : {}),
    ...(configuration ? { configuration } : {}),
    conversations: "codex",
    ...conversationStorage(settings),
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => codexRequest(settings, input),
    events: codexEvents,
    liveInput: Object.freeze({
      open: (input: AgentInput) => codexAppSession(settings, input),
    }),
    quota: textMatcher(codexQuotaPatterns),
    unavailable: textMatcher(codexUnavailablePatterns, transientNoticePatterns),
  } satisfies AgentAdapter);
}

export function createCodexHarness(settings: CodexSettings = {}): CliHarness {
  harnessSettings(settings);
  conversationSettings("Codex", "codex", settings);
  const configured = configuredSettings(settings);
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindCodex({ ...configured, ...(model === undefined ? {} : { model }) }),
  });
}
