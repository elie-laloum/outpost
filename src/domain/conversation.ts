import type { ConversationStore } from "./conversation.types.ts";
import { invariant } from "./errors.ts";

export function isConversationStore(
  value: unknown,
): value is ConversationStore {
  return (
    value !== null &&
    typeof value === "object" &&
    "locate" in value &&
    "capture" in value &&
    "restore" in value &&
    typeof value.locate === "function" &&
    typeof value.capture === "function" &&
    typeof value.restore === "function" &&
    (!("format" in value) ||
      value.format === undefined ||
      typeof value.format === "string")
  );
}

export function conversationFormat(
  owner: string,
  store: ConversationStore,
  format: string,
): void {
  invariant(
    store.format === undefined || store.format === format,
    `${owner} conversations must use the "${format}" format, not "${store.format}"`,
  );
}
