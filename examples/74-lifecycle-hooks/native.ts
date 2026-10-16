import {
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  defineAntigravityHook,
  defineClaudeHook,
  defineCodexHook,
  defineCopilotHook,
  defineKimiHook,
} from "@elie-laloum/outpost";

import { profile } from "./profile.ts";

export const nativeHarnesses = {
  claude: () =>
    createClaudeHarness({
      authentication: "account",
      profile,
      hooks: [
        defineClaudeHook({
          on: "PreToolUse",
          run({ event }) {
            console.log(`[Claude PreToolUse] ${event.tool_name}`);
            if (event.tool_name === "Bash")
              return {
                hookSpecificOutput: {
                  hookEventName: "PreToolUse",
                  permissionDecision: "deny",
                  permissionDecisionReason:
                    "Use a file-reading tool in this example.",
                },
              };
          },
        }),
      ],
    }),
  codex: () =>
    createCodexHarness({
      authentication: "account",
      profile,
      hooks: [
        defineCodexHook({
          on: "PreToolUse",
          run({ event }) {
            console.log(`[Codex PreToolUse] ${event.tool_name}`);
          },
        }),
      ],
    }),
  copilot: () =>
    createCopilotHarness({
      authentication: "account",
      profile,
      hooks: [
        defineCopilotHook({
          on: "preToolUse",
          run({ event }) {
            console.log(`[Copilot preToolUse] ${event.toolName}`);
          },
        }),
      ],
    }),
  kimi: () =>
    createKimiHarness({
      authentication: "account",
      profile,
      hooks: [
        defineKimiHook({
          on: "PreToolUse",
          run({ event }) {
            console.log(`[Kimi PreToolUse] ${event.tool_name}`);
          },
        }),
      ],
    }),
  antigravity: () =>
    createAntigravityHarness({
      authentication: "account",
      profile,
      hooks: [
        defineAntigravityHook({
          on: "PreToolUse",
          run({ event }) {
            console.log(`[Antigravity PreToolUse] ${event.toolCall?.name}`);
          },
        }),
      ],
    }),
};
