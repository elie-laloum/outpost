import { join, posix } from "node:path";
import type { NativeConversationStore } from "../../../domain/conversation.types.ts";
import type { TranscriptConversationLayout } from "../../../infrastructure/conversations/layout.types.ts";
import { createTranscriptConversations } from "../../../infrastructure/conversations/transcript-store.ts";
import { CODEX_ROLLOUT_DATE } from "./codex-conversations.constants.ts";

function rolloutPath(original: string): string[] {
  const file = posix.basename(original.replaceAll("\\", "/"));
  const date = CODEX_ROLLOUT_DATE.exec(file);
  return [...(date ? date.slice(1) : []), file];
}

export const codexConversationLayout: TranscriptConversationLayout = {
  format: "codex",
  sidecars: false,
  directory: (_repository, home) => join(home, ".codex", "sessions"),
  searchRoot: (home) => join(home, ".codex", "sessions"),
  remoteSearchRoot: (home) => posix.join(home, ".codex", "sessions"),
  pattern: (id) => `*-${id}.jsonl`,
  matches: (file, id) => file.endsWith(`-${id}.jsonl`),
  capturePath: (_id, _repository, home, original) =>
    join(home, ".codex", "sessions", ...rolloutPath(original)),
  remotePath: (_id, lease, original) =>
    posix.join(lease.home, ".codex", "sessions", ...rolloutPath(original)),
};

/** Creates the native store for Codex rollouts under ~/.codex/sessions. */
export function createCodexConversations(): NativeConversationStore {
  return createTranscriptConversations(codexConversationLayout);
}
