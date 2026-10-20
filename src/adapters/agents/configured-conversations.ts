import { resolve } from "node:path";
import type {
  ConversationContext,
  NativeConversationStore,
} from "../../domain/conversation.types.ts";
import { OutpostError } from "../../domain/errors.ts";
import type { TranscriptConversationLayout } from "../../infrastructure/conversations/layout.types.ts";
import { createTranscriptConversations } from "../../infrastructure/conversations/transcript-store.ts";
import { conversationHomeProbe } from "./configured-conversations.constants.ts";

export function configuredConversations(
  layout: TranscriptConversationLayout,
  variable: string,
  configured: (directory: string) => TranscriptConversationLayout,
): NativeConversationStore {
  const host = (home?: string) => {
    const directory = home === undefined ? process.env[variable] : undefined;
    return directory ? configured(resolve(directory)) : layout;
  };
  const local = async (context: ConversationContext) => {
    const result = await context.sandbox.invoke({
      executable: process.execPath,
      arguments: ["-p", conversationHomeProbe.script, variable],
      retain: conversationHomeProbe.retain,
      deadlineMs: conversationHomeProbe.deadlineMs,
    });
    if (result.status !== 0)
      throw new OutpostError(
        "session",
        `Could not resolve ${variable} for native conversation storage`,
      );
    const directory: unknown = JSON.parse(result.stdout);
    if (typeof directory !== "string")
      throw new OutpostError(
        "session",
        `Invalid ${variable} for native conversation storage`,
      );
    return directory
      ? configured(resolve(context.sandbox.root, directory))
      : layout;
  };
  const native = createTranscriptConversations(layout);
  return {
    ...native,
    locate: (id, repository, home) =>
      createTranscriptConversations(host(home)).locate(id, repository, home),
    directory: (repository, home) =>
      createTranscriptConversations(host(home)).directory(repository, home),
    async capture(id, context) {
      const source = context.local ? await local(context) : layout;
      return createTranscriptConversations({
        ...host(context.home),
        searchRoot: source.searchRoot,
        remoteSearchRoot: source.remoteSearchRoot,
        ...(source.preferredPath
          ? { preferredPath: source.preferredPath }
          : {}),
      }).capture(id, context);
    },
    async restore(record, context) {
      const target = context.local ? await local(context) : layout;
      return createTranscriptConversations(target).restore(record, context);
    },
  };
}
