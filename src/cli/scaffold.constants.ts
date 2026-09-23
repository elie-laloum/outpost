import { agentVersions } from "../providers/versions.ts";

export const imageRecipe = `FROM node:24-bookworm-slim
ARG AGENT_UID=1000
ARG AGENT_GID=1000
RUN apt-get update && apt-get install -y --no-install-recommends git gh openssh-client ca-certificates curl procps util-linux python3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g --allow-scripts=@anthropic-ai/claude-code @openai/codex@${agentVersions.codex} @anthropic-ai/claude-code@${agentVersions.claude}
RUN groupmod -o -g "$AGENT_GID" node && usermod -o -u "$AGENT_UID" -g "$AGENT_GID" node
ENV HOME=/home/agent
USER $AGENT_UID:$AGENT_GID
WORKDIR /workspace
`;

export const supportedAgents: readonly string[] = ["codex", "claude"];
export const supportedProviders: readonly string[] = [
  "docker",
  "podman",
  "vercel",
  "daytona",
  "local",
];
export const supportedTemplates: readonly string[] = [
  "blank",
  "iterate",
  "review",
  "plan",
  "plan-review",
];
export const supportedTrackers: readonly string[] = [
  "github",
  "beads",
  "custom",
];
export const supportedManagers: readonly string[] = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
];
export const managerLocks = [
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
] as const;
export const providerPackages = {
  docker: [],
  podman: [],
  local: [],
  vercel: ["@vercel/sandbox"],
  daytona: ["@daytona/sdk"],
} as const;
