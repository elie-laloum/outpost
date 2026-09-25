import type { CliModelSupport } from "./settings.types.ts";

export const CLAUDE_MAX_OUTPUT_VARIABLE = "CLAUDE_CODE_MAX_OUTPUT_TOKENS";

export const claudeModelSupport: CliModelSupport = {
  agent: "Claude Code",
  reasoning: new Set(["low", "medium", "high", "xhigh", "max"]),
  maxOutputTokens: true,
};

export const codexModelSupport: CliModelSupport = {
  agent: "Codex",
  reasoning: new Set(["low", "medium", "high", "xhigh", "max"]),
  maxOutputTokens: false,
};

export const geminiModelSupport: CliModelSupport = {
  agent: "Gemini CLI",
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const HARNESS_MODEL_KEYS = ["model", "reasoning", "maxOutputTokens"];
