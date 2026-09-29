import type { ConversationStore } from "../domain/conversation.types.ts";
import { createHarnessConversations } from "../infrastructure/conversations/harness-store.ts";
import { projectKey } from "../infrastructure/conversations/identity.ts";
import { relocateTranscript } from "../infrastructure/conversations/relocate.ts";
import { createTransportStore } from "../infrastructure/transport-conversations.ts";
import type { TransportConversationOptions } from "../infrastructure/transport-conversations.types.ts";

/** Archives the conversations a base store captures through a transport. */
export function createTransportConversations(
  base: ConversationStore,
  options: TransportConversationOptions,
): ConversationStore {
  return createTransportStore(base, options);
}

export const conversations = Object.freeze({
  transported: createTransportConversations,
  harness: createHarnessConversations,
  rewrite: relocateTranscript,
  projectKey,
});
