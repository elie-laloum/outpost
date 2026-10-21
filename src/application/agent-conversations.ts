import { invariant } from "../domain/errors.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type {
  ConversationContext,
  ConversationStore,
} from "../domain/conversation.types.ts";
import { storageFor } from "./agent-storage.ts";
import type {
  AgentConversationsOptions,
  AgentConversations,
} from "./agent-conversations.types.ts";

export async function restoreConversation(
  storage: ConversationStore,
  id: string,
  context: ConversationContext,
  home = context.home,
): Promise<void> {
  const found = await storage.locate(
    id,
    context.repository,
    home,
    context.runtimeDirectory,
  );
  await storage.restore(found, context);
}

export function createAgentConversations({
  agent,
  context,
  continuation,
  onCapture,
}: AgentConversationsOptions): AgentConversations {
  const storage = storageFor(agent);
  const session: AgentConversations = {
    selected: agent,
    conversations: new Set(
      continuation && !continuation.fork ? [continuation.id] : [],
    ),
    captured: new Map(),
    conversation: continuation?.id,
    async save(id) {
      invariant(storage, "Conversation storage is unavailable");
      const record = await observedOperation(
        context.observation,
        "conversation",
        "conversation.capture",
        () => storage.capture(id, context),
      );
      session.captured.set(id, record);
      await onCapture?.(record);
      return record;
    },
    async captureTurn(turn) {
      if (!turn.conversation || !storage || agent.capture === false)
        return turn;
      const record = await session.save(turn.conversation);
      return {
        ...turn,
        transcript: record.file,
        ...(record.reference ? { transcriptReference: record.reference } : {}),
      };
    },
  };
  return session;
}
