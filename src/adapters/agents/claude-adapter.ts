import { invariant } from "../../domain/errors.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { authenticationCommand } from "./authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { claudeEvents, claudeTranscriptUsage } from "./claude-events.ts";
import { claudeRequest } from "./claude-request.ts";
import {
  CLAUDE_MAX_OUTPUT_VARIABLE,
  claudeModelSupport,
} from "./model-support.constants.ts";
import { harnessSettings, supportModel } from "./model-support.ts";
import type { Bound, ClaudeSettings } from "./settings.types.ts";

function bindClaude(settings: Bound<ClaudeSettings>): AgentAdapter {
  supportModel(claudeModelSupport, settings.model);
  const maxOutputTokens = settings.model?.maxOutputTokens;
  invariant(
    maxOutputTokens === undefined ||
      !Object.hasOwn(settings.variables ?? {}, CLAUDE_MAX_OUTPUT_VARIABLE),
    `Set maxOutputTokens on the agent model or ${CLAUDE_MAX_OUTPUT_VARIABLE}, not both`,
  );
  return Object.freeze({
    name: "claude",
    authenticate: authenticationCommand("claude", settings.authentication),
    conversations: "claude",
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
    transcriptUsage: claudeTranscriptUsage,
  } satisfies AgentAdapter);
}

export function claudeHarness(settings: ClaudeSettings = {}): CliHarness {
  harnessSettings(settings);
  const configured = Object.freeze({
    ...settings,
    variables: Object.freeze({ ...settings.variables }),
  });
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindClaude({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
