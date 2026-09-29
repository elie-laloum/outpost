import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";

export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mcpServers?: McpServers;
  readonly mode?: "accept-edits" | "plan";
}
