import type { AgentAuthentication } from "../../../domain/agent.types.ts";
import type { Variables } from "../../../domain/command.types.ts";
import type { ConversationStore } from "../../../domain/conversation.types.ts";
import type { McpServers } from "../../../domain/mcp-server.types.ts";

export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
}
