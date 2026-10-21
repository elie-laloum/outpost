import type { Agent } from "../domain/agent.types.ts";
import type {
  ConversationContext,
  ConversationRecord,
} from "../domain/conversation.types.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";

export interface AgentConversationsOptions {
  readonly agent: Agent;
  readonly context: ConversationContext;
  readonly continuation?: DispatchOptions["continuation"];
  readonly onCapture?: (record: ConversationRecord) => void | Promise<void>;
}

export interface AgentConversations {
  readonly selected: Agent;
  readonly conversations: Set<string>;
  readonly captured: Map<string, ConversationRecord>;
  conversation: string | undefined;
  save(id: string): Promise<ConversationRecord>;
  captureTurn(turn: Turn): Promise<Turn>;
}
