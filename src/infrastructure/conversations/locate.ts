import { sessionConversations } from "./session-bundle.ts";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { OutpostError } from "../../domain/errors.ts";
import type {
  ConversationFormat,
  ConversationLocation,
} from "../conversations.types.ts";
import { files } from "./files.ts";
import { conversationLayout } from "./layout.ts";
import { validId } from "./paths.ts";

export async function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home?: string,
): Promise<ConversationLocation> {
  if (format === "copilot" || format === "kimi") {
    const record = await sessionConversations(format).locate(
      id,
      repository,
      home,
    );
    return { ...record, format };
  }
  home ??= homedir();
  validId(id);
  const layout = conversationLayout(format);
  const expected = layout.preferredPath?.(id, repository, home);
  if (expected && (await stat(expected).catch(() => undefined))?.isFile())
    return { id, file: expected, format };
  const found = (await files(layout.searchRoot(home))).find((file) =>
    layout.matches(file, id),
  );
  if (found) return { id, file: found, format };
  throw new OutpostError(
    "session",
    `Conversation ${id} was not found in native ${format} storage`,
    { id, repository },
  );
}
