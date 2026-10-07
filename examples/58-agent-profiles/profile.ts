import { defineAgentProfile } from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  instructions: "Never modify generated files. Read notes before answering.",
  mcpServers: {
    docs: {
      command: "node",
      arguments: ["mcp/docs.mjs"],
      tools: { exclude: ["delete_note"] },
    },
  },
});

export const restricted = defineAgentProfile({
  instructions: profile.instructions!,
  mcpServers: profile.mcpServers!,
  allowedTools: ["read", "shell:npm test"],
});
