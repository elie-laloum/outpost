import type { AgentProfile } from "../../../domain/agent-profile.types.ts";
import type { AgentAuthentication } from "../../../domain/agent.types.ts";
import type { Variables } from "../../../domain/command.types.ts";
import type { ConversationStore } from "../../../domain/conversation.types.ts";
import type { McpServers } from "../../../domain/mcp-server.types.ts";

export interface CopilotSettings {
  readonly hooks?: readonly import("./copilot-hooks.types.ts").CopilotHook[];
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
