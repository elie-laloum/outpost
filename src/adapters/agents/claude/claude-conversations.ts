import { basename, join, posix, resolve } from "node:path";
import type { NativeConversationStore } from "../../../domain/conversation.types.ts";
import { projectKey } from "../../../infrastructure/conversations/identity.ts";
import type { TranscriptConversationLayout } from "../../../infrastructure/conversations/layout.types.ts";
import { createTranscriptConversations } from "../../../infrastructure/conversations/transcript-store.ts";

const directory = (repository: string, home: string) =>
  join(home, ".claude", "projects", projectKey(resolve(repository)));
const location = (id: string, repository: string, home: string) =>
  join(directory(repository, home), `${id}.jsonl`);

export const claudeConversationLayout: TranscriptConversationLayout = {
  format: "claude",
  sidecars: true,
  directory,
  searchRoot: (home) => join(home, ".claude", "projects"),
  remoteSearchRoot: (home) => posix.join(home, ".claude", "projects"),
  pattern: (id) => `${id}.jsonl`,
  matches: (file, id) => basename(file) === `${id}.jsonl`,
  preferredPath: location,
  capturePath: location,
  remotePath: (id, lease) =>
    posix.join(
      lease.home,
      ".claude",
      "projects",
      projectKey(lease.root),
      `${id}.jsonl`,
    ),
};

/** Creates the native store for Claude Code transcripts under ~/.claude/projects. */
export function createClaudeConversations(): NativeConversationStore {
  return createTranscriptConversations(claudeConversationLayout);
}
