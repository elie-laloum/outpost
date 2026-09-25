import type { Agent } from "../domain/agent.types.ts";
import { nativeConversations } from "../infrastructure/conversations/native-store.ts";

export const storageFor = (agent: Agent) =>
  agent.storage ??
  (agent.conversations ? nativeConversations(agent.conversations) : undefined);
