import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import type { ConversationStore } from "../../domain/conversation.types.ts";

export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
}
