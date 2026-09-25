import { transportConversations } from "./transport-conversations.ts";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { ConversationFormat } from "./conversations.types.ts";
import { captureConversation } from "./conversations/capture.ts";
import { conversationLayout } from "./conversations/layout.ts";
import { locateConversation } from "./conversations/locate.ts";
import { nativeConversations } from "./conversations/native-store.ts";
import { projectKey, remotePath, validId } from "./conversations/paths.ts";
import { relocateTranscript } from "./conversations/relocate.ts";
import { restoreConversation } from "./conversations/restore.ts";

export type {
  ConversationFormat,
  ConversationLocation,
} from "./conversations.types.ts";
export { captureConversation } from "./conversations/capture.ts";
export { locateConversation } from "./conversations/locate.ts";
export { nativeConversations } from "./conversations/native-store.ts";
export { projectKey } from "./conversations/paths.ts";
export { relocateTranscript } from "./conversations/relocate.ts";
export { restoreConversation } from "./conversations/restore.ts";

export const conversations = {
  transported: transportConversations,
  native: nativeConversations,
  locate: locateConversation,
  capture: captureConversation,
  restore: restoreConversation,
  rewrite: relocateTranscript,
  projectKey,
  claudePath(id: string, repository: string, home = homedir()): string {
    validId(id);
    return join(
      home,
      ".claude",
      "projects",
      projectKey(resolve(repository)),
      `${id}.jsonl`,
    );
  },
  directory(
    format: ConversationFormat,
    repository: string,
    home = homedir(),
  ): string {
    return conversationLayout(format).directory(repository, home);
  },
  destination: remotePath,
};
