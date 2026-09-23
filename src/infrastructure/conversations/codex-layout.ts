import { basename, join, posix } from "node:path";
import type { ConversationLayout } from "./layout.types.ts";

function datePath(): string[] {
  return new Date().toISOString().slice(0, 10).split("-");
}

export function codexLayout(): ConversationLayout {
  return {
    sidecars: false,
    directory: (_repository, home) => join(home, ".codex", "sessions"),
    searchRoot: (home) => join(home, ".codex", "sessions"),
    remoteSearchRoot: (home) => posix.join(home, ".codex", "sessions"),
    pattern: (id) => `*-${id}.jsonl`,
    matches: (file, id) => file.endsWith(`-${id}.jsonl`),
    capturePath: (_id, _repository, home, original) =>
      join(
        home,
        ".codex",
        "sessions",
        ...datePath(),
        posix.basename(original.replaceAll("\\", "/")),
      ),
    remotePath: (_id, lease, original) =>
      posix.join(
        lease.home,
        ".codex",
        "sessions",
        ...datePath(),
        basename(original),
      ),
  };
}
