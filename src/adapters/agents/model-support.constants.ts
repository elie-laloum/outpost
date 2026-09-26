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

export const antigravityModelSupport: CliModelSupport = {
  agent: "Antigravity CLI",
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const copilotModelSupport: CliModelSupport = {
  agent: "GitHub Copilot CLI",
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const kimiModelSupport: CliModelSupport = {
  agent: "Kimi Code",
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const HARNESS_MODEL_KEYS = ["model", "reasoning", "maxOutputTokens"];
