import { access } from "node:fs/promises";
import { join } from "node:path";
import type { ConversationStore } from "../../domain/conversation.types.ts";
import { OutpostError } from "../../domain/errors.ts";
import { validId } from "./identity.ts";

export function harnessTranscriptPath(
  repository: string,
  id: string,
  runtimeDirectory?: string,
): string {
  validId(id);
  return join(
    runtimeDirectory ?? join(repository, ".outpost"),
    "conversations",
    "harness",
    `${id}.jsonl`,
  );
}

export function createHarnessConversations(): ConversationStore {
  const locate = async (
    id: string,
    repository: string,
    _home?: string,
    runtimeDirectory?: string,
  ) => {
    const file = harnessTranscriptPath(repository, id, runtimeDirectory);
    await access(file).catch(() => {
      throw new OutpostError("session", "Harness conversation does not exist", {
        id,
      });
    });
    return { id, file, format: "harness" };
  };
  const store: ConversationStore = {
    name: "harness",
    format: "harness",
    locate,
    capture: (id, context) =>
      locate(id, context.repository, context.home, context.runtimeDirectory),
    async restore() {},
  };
  return Object.freeze(store);
}
