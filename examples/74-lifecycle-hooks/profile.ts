import {
  defineAgentProfile,
  defineHarnessHook,
  defineClaudeHook,
  defineCodexHook,
  defineCopilotHook,
  defineKimiHook,
  defineAntigravityHook,
} from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  hooks: {
    outpost: [
      defineHarnessHook({
        on: "session-start",
        run({ source }) {
          console.log(`[profile session-start] ${source}`);
          return { instructions: "Summarize the example notes." };
        },
      }),
      defineHarnessHook({
        on: "before-prompt",
        command: {
          executable: process.execPath,
          arguments: ["scripts/prompt-hook.mjs"],
        },
      }),
    ],
    claude: [
      defineClaudeHook({
        on: "SessionStart",
        run({ event }) {
          console.log(`[profile Claude SessionStart] ${event.session_id}`);
        },
      }),
    ],
    codex: [
      defineCodexHook({
        on: "SessionStart",
        run({ event }) {
          console.log(`[profile Codex SessionStart] ${event.session_id}`);
        },
      }),
    ],
    copilot: [
      defineCopilotHook({
        on: "sessionStart",
        run({ event }) {
          console.log(`[profile Copilot sessionStart] ${event.sessionId}`);
        },
      }),
    ],
    kimi: [
      defineKimiHook({
        on: "SessionStart",
        run({ event }) {
          console.log(`[profile Kimi SessionStart] ${event.session_id}`);
        },
      }),
    ],
    antigravity: [
      defineAntigravityHook({
        on: "SessionStart",
        run({ event }) {
          console.log(
            `[profile Antigravity SessionStart] ${event.conversationId}`,
          );
        },
      }),
    ],
  },
});
