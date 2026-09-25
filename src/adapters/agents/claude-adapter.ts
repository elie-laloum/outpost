import { invariant } from "../../domain/errors.ts";
import { authenticationCommand } from "./authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { claudeEvents, claudeTranscriptUsage } from "./claude-events.ts";
import { claudeRequest } from "./claude-request.ts";
import type { ClaudeSettings } from "./settings.types.ts";

function bindClaude(settings: ClaudeSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "claude",
    authenticate: authenticationCommand("claude", settings.authentication),
    conversations: "claude",
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => claudeRequest(settings, input),
    events: claudeEvents,
    transcriptUsage: claudeTranscriptUsage,
  } satisfies AgentAdapter);
}

export function claudeHarness(
  settings: Omit<ClaudeSettings, "model"> = {},
): CliHarness {
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
      bindClaude({
        ...configured,
        ...(model === undefined ? {} : { model }),
      }),
  });
}
