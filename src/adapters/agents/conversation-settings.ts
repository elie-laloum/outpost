import {
  conversationFormat,
  isConversationStore,
} from "../../domain/conversation.ts";
import type { AgentAdapter } from "../../domain/agent.types.ts";
import type { NativeConversationStore } from "../../domain/conversation.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { ConversationSettings } from "./settings.types.ts";

export function conversationSettings(
  agent: string,
  format: string,
  settings: ConversationSettings,
): void {
  if (settings.conversations === undefined) return;
  invariant(
    isConversationStore(settings.conversations),
    `${agent} conversations must be a conversation store`,
  );
  conversationFormat(agent, settings.conversations, format);
  invariant(
    settings.saveConversations !== false,
    `${agent} cannot store conversations when saveConversations is false`,
  );
}

export const conversationStorage = (
  settings: ConversationSettings,
  native: () => NativeConversationStore,
): Pick<AgentAdapter, "storage"> => ({
  storage: settings.conversations ?? native(),
});
