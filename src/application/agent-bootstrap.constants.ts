import { agentVersions } from "../providers/versions.ts";

export const agentPackages = Object.freeze({
  claude: `@anthropic-ai/claude-code@${agentVersions.claude}`,
  gemini: `@google/gemini-cli@${agentVersions.gemini}`,
  codex: `@openai/codex@${agentVersions.codex}`,
});
