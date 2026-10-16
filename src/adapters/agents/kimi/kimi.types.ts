import type { AgentProfile } from "../../../domain/agent-profile.types.ts";
import type { AgentAuthentication } from "../../../domain/agent.types.ts";
import type { Variables } from "../../../domain/command.types.ts";
import type { ConversationStore } from "../../../domain/conversation.types.ts";
import type { McpServers } from "../../../domain/mcp-server.types.ts";

export interface KimiSettings {
  readonly hooks?: readonly import("./kimi-hooks.types.ts").KimiHook[];
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
