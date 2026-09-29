import { mcpConfigurationPlanner } from "./mcp-configuration.ts";
import { textMatcher } from "./text-matcher.ts";
import {
  conversationSettings,
  conversationStorage,
} from "./conversation-settings.ts";
import { copilotQuotaPatterns } from "./quota.constants.ts";
import {
  copilotUnavailablePatterns,
  transientNoticePatterns,
} from "./unavailable.constants.ts";
import { copilotUsage } from "./copilot-usage.ts";
import { sessionUsageCommand, sessionUsageResult } from "./session-usage.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { copilotCredentials } from "./copilot-authentication.ts";
import { copilotEvents } from "./copilot-events.ts";
import { copilotRequest } from "./copilot-request.ts";
import type { CopilotSettings } from "./copilot.types.ts";
import { copilotModelSupport } from "./model-support.constants.ts";
import {
  configuredSettings,
  harnessSettings,
  supportModel,
} from "./model-support.ts";
import type { Bound } from "./settings.types.ts";

function bindCopilot(settings: Bound<CopilotSettings>): AgentAdapter {
  supportModel(copilotModelSupport, settings.model);
  const credentials = credentialPlanner(
    "GitHub Copilot CLI",
    copilotCredentials,
    settings.authentication,
    settings.model,
  );
  const configuration = mcpConfigurationPlanner(
    "GitHub Copilot CLI",
    settings.mcpServers,
  );
  return Object.freeze({
    name: "copilot",
    ...(credentials ? { credentials } : {}),
    ...(configuration ? { configuration } : {}),
    bootstrap: "copilot",
    resumable: true,
    forkable: false,
    conversations: "copilot",
    ...conversationStorage(settings),
    requiresFinishedEvent: true,
    variables: Object.freeze({
      COPILOT_AUTO_UPDATE: "false",
      ...settings.variables,
    }),
    request: (input) => copilotRequest(settings, input),
    events: copilotEvents,
    quota: textMatcher(copilotQuotaPatterns),
    unavailable: textMatcher(
      copilotUnavailablePatterns,
      transientNoticePatterns,
    ),
    usage: "session",
    usageCommand: (conversation) =>
      sessionUsageCommand("copilot", conversation),
    usageResult: (text) => sessionUsageResult(text, copilotUsage),
  } satisfies AgentAdapter);
}

export function copilotHarness(settings: CopilotSettings = {}): CliHarness {
  harnessSettings(settings);
  conversationSettings("GitHub Copilot CLI", "copilot", settings);
  const configured = configuredSettings(settings);
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindCopilot({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
