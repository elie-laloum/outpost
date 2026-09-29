import type { Agent } from "../domain/agent.types.ts";
import type { ConversationStore } from "../domain/conversation.types.ts";
import { createHarnessConversations } from "../infrastructure/conversations/harness-store.ts";

export const storageFor = (agent: Agent): ConversationStore | undefined =>
  agent.storage ??
  (agent.kind === "custom" && agent.resumable
    ? createHarnessConversations()
    : undefined);
