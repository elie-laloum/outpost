import type { AgentAdapter } from "../../domain/agent.types.ts";
import { codexProvider } from "./codex-provider.ts";
import { codexEvents } from "./codex-events.ts";
import { codexRequest } from "./codex-request.ts";
import type { CodexSettings } from "./settings.types.ts";

export function codex(settings: CodexSettings = {}): AgentAdapter {
  codexProvider(settings);
  return Object.freeze({
    name: "codex",
    conversations: "codex",
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => codexRequest(settings, input),
    events: codexEvents,
  } satisfies AgentAdapter);
}
