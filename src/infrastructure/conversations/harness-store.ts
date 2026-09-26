import { access } from "node:fs/promises";
import { join } from "node:path";
import type { ConversationStore } from "../../domain/conversation.types.ts";
import { OutpostError } from "../../domain/errors.ts";
import { validId } from "./identity.ts";

export function harnessTranscriptPath(repository: string, id: string): string {
  validId(id);
  return join(
    repository,
    ".outpost",
    "conversations",
    "harness",
    `${id}.jsonl`,
  );
}

export function harnessConversations(): ConversationStore {
  const locate = async (id: string, repository: string) => {
    const file = harnessTranscriptPath(repository, id);
    await access(file).catch(() => {
      throw new OutpostError("session", "Harness conversation does not exist", {
        id,
      });
    });
    return { id, file, format: "harness" };
  };
  const store: ConversationStore = {
    name: "harness",
    locate,
    capture: (id, context) => locate(id, context.repository),
    async restore() {},
  };
  return Object.freeze(store);
}
