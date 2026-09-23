import type { AgentAdapter } from "../../domain/agent.types.ts";
import { claudeEvents, claudeTranscriptUsage } from "./claude-events.ts";
import { claudeRequest } from "./claude-request.ts";
import type { ClaudeSettings } from "./settings.types.ts";

export function claude(settings: ClaudeSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "claude",
    conversations: "claude",
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => claudeRequest(settings, input),
    events: claudeEvents,
    transcriptUsage: claudeTranscriptUsage,
  } satisfies AgentAdapter);
}
