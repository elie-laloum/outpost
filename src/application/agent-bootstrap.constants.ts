import { antigravityInstaller } from "../providers/versions.constants.ts";
import { agentVersions } from "../providers/versions.ts";
import type { AgentInstaller } from "./agent-bootstrap.types.ts";

export const agentInstallers: Readonly<Record<string, AgentInstaller>> =
  Object.freeze({
    claude: {
      kind: "npm",
      binary: "claude",
      package: `@anthropic-ai/claude-code@${agentVersions.claude}`,
      allowScripts: true,
    },
    codex: {
      kind: "npm",
      binary: "codex",
      package: `@openai/codex@${agentVersions.codex}`,
    },
    copilot: {
      kind: "npm",
      binary: "copilot",
      package: `@github/copilot@${agentVersions.copilot}`,
    },
    kimi: {
      kind: "npm",
      binary: "kimi",
      package: `@moonshot-ai/kimi-code@${agentVersions.kimi}`,
    },
    antigravity: {
      kind: "script",
      binary: "agy",
      url: antigravityInstaller,
      installed: ".local/bin/agy",
    },
  });
