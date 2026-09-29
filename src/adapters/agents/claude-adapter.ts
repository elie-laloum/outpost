import { mcpConfigurationPlanner } from "./mcp-configuration.ts";
import { textMatcher } from "./text-matcher.ts";
import {
  conversationSettings,
  conversationStorage,
} from "./conversation-settings.ts";
import { claudeQuotaPatterns } from "./quota.constants.ts";
import {
  claudeUnavailablePatterns,
  transientNoticePatterns,
} from "./unavailable.constants.ts";
import { invariant } from "../../domain/errors.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialPlanner } from "./authentication.ts";
import { claudeCredentials } from "./claude-authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { claudeEvents, claudeTranscriptUsage } from "./claude-events.ts";
import { claudeLiveInput } from "./claude-input.ts";
import { claudeRequest } from "./claude-request.ts";
import {
  CLAUDE_MAX_OUTPUT_VARIABLE,
  claudeModelSupport,
} from "./model-support.constants.ts";
import {
  configuredSettings,
  harnessSettings,
  supportModel,
} from "./model-support.ts";
import type { Bound, ClaudeSettings } from "./settings.types.ts";

function bindClaude(settings: Bound<ClaudeSettings>): AgentAdapter {
  supportModel(claudeModelSupport, settings.model);
  const maxOutputTokens = settings.model?.maxOutputTokens;
  invariant(
    maxOutputTokens === undefined ||
      !Object.hasOwn(settings.variables ?? {}, CLAUDE_MAX_OUTPUT_VARIABLE),
    `Set maxOutputTokens on the agent model or ${CLAUDE_MAX_OUTPUT_VARIABLE}, not both`,
  );
  const credentials = credentialPlanner(
    "Claude Code",
    claudeCredentials,
    settings.authentication,
    settings.model,
  );
  const configuration = mcpConfigurationPlanner(
    "Claude Code",
    settings.mcpServers,
  );
  return Object.freeze({
    name: "claude",
    ...(credentials ? { credentials } : {}),
    ...(configuration ? { configuration } : {}),
    conversations: "claude",
    ...conversationStorage(settings),
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({
      ...settings.variables,
      ...(maxOutputTokens === undefined
        ? {}
        : { [CLAUDE_MAX_OUTPUT_VARIABLE]: String(maxOutputTokens) }),
    }),
    request: (input) => claudeRequest(settings, input),
    events: claudeEvents,
    liveInput: claudeLiveInput,
    quota: textMatcher(claudeQuotaPatterns),
    unavailable: textMatcher(
      claudeUnavailablePatterns,
      transientNoticePatterns,
    ),
    transcriptUsage: claudeTranscriptUsage,
  } satisfies AgentAdapter);
}

export function createClaudeHarness(settings: ClaudeSettings = {}): CliHarness {
  harnessSettings(settings);
  conversationSettings("Claude Code", "claude", settings);
  const configured = configuredSettings(settings);
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindClaude({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
