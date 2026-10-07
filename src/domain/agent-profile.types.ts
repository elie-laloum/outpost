import type { McpServers } from "./mcp-server.types.ts";

export type AgentProfileTool = "read" | "edit" | "shell" | `shell:${string}`;

export interface AgentProfileOptions {
  readonly instructions?: string;
  readonly allowedTools?: readonly AgentProfileTool[];
  readonly mcpServers?: McpServers;
}

export interface AgentProfile extends AgentProfileOptions {
  readonly kind: "agent-profile";
}
