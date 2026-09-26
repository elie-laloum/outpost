import type { Agent } from "../domain/agent.types.ts";
import type { ConversationStore } from "../domain/conversation.types.ts";
import { harnessConversations } from "../infrastructure/conversations/harness-store.ts";
import { nativeConversations } from "../infrastructure/conversations/native-store.ts";

export const storageFor = (agent: Agent): ConversationStore | undefined =>
  agent.storage ?? defaultStorage(agent);

function defaultStorage(agent: Agent): ConversationStore | undefined {
  if (agent.kind === "custom")
    return agent.resumable ? harnessConversations() : undefined;
  return agent.conversations
    ? nativeConversations(agent.conversations)
    : undefined;
}
