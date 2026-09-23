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
