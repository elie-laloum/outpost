import { invariant } from "../../domain/errors.ts";
import { authenticationCommand } from "./authentication.ts";
import type { AgentAdapter, CliHarness } from "../../domain/agent.types.ts";
import { codexProvider } from "./codex-provider.ts";
import { codexEvents } from "./codex-events.ts";
import { codexRequest } from "./codex-request.ts";
import type { CodexSettings } from "./settings.types.ts";

function bindCodex(settings: CodexSettings = {}): AgentAdapter {
  codexProvider(settings);
  return Object.freeze({
    name: "codex",
    authenticate: authenticationCommand(
      "codex",
      settings.authentication,
      settings.modelProvider !== undefined,
    ),
    conversations: "codex",
    resumable: true,
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request: (input) => codexRequest(settings, input),
    events: codexEvents,
  } satisfies AgentAdapter);
}

export const codex = Object.freeze({
  harness(settings: Omit<CodexSettings, "model"> = {}): CliHarness {
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
        bindCodex({ ...configured, ...(model === undefined ? {} : { model }) }),
    });
  },
});
