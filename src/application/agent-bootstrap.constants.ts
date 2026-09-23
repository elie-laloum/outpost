import { agentVersions } from "../providers/versions.ts";

export const agentPackages = Object.freeze({
  claude: `@anthropic-ai/claude-code@${agentVersions.claude}`,
  codex: `@openai/codex@${agentVersions.codex}`,
});
