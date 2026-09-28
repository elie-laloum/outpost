import { sessionConversations } from "./session-bundle.ts";
import type { ConversationStore } from "../../domain/conversation.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { ConversationFormat } from "../conversations.types.ts";
import { captureConversation } from "./capture.ts";
import { locateConversation } from "./locate.ts";
import { restoreConversation } from "./restore.ts";

export function nativeConversations(
  format: ConversationFormat,
): ConversationStore {
  if (format === "copilot" || format === "kimi")
    return sessionConversations(format);
  return {
    name: format,
    locate(id, repository, home) {
      return locateConversation(format, id, repository, home);
    },
    capture(id, context) {
      return captureConversation(
        format,
        id,
        context.repository,
        context.sandbox,
        context.staging,
        context,
      );
    },
    async restore(record, context) {
      invariant(
        record.format === format,
        "Conversation format does not match its storage",
      );
      if (
        context.local &&
        context.sandbox.root === context.repository &&
        record.reference === undefined
      )
        return;
      return restoreConversation(
        { ...record, format },
        context.sandbox,
        context.staging,
      );
    },
  };
}
