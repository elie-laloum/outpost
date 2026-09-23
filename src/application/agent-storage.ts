import type { AgentAdapter } from "../domain/agent.types.ts";
import { nativeConversations } from "../infrastructure/conversations/native-store.ts";

export const storageFor = (agent: AgentAdapter) =>
  agent.storage ??
  (agent.conversations ? nativeConversations(agent.conversations) : undefined);
