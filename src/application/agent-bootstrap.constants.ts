import { agentVersions } from "../providers/versions.ts";
import type { AgentInstaller } from "./agent-bootstrap.types.ts";

export const agentInstallers: Readonly<Record<string, AgentInstaller>> =
  Object.freeze({
    claude: {
      binary: "claude",
      package: `@anthropic-ai/claude-code@${agentVersions.claude}`,
      allowScripts: true,
    },
    codex: { binary: "codex", package: `@openai/codex@${agentVersions.codex}` },
    copilot: {
      binary: "copilot",
      package: `@github/copilot@${agentVersions.copilot}`,
    },
    kimi: {
      binary: "kimi",
      package: `@moonshot-ai/kimi-code@${agentVersions.kimi}`,
    },
  });
