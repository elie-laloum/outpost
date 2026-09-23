import { basename, join, posix, resolve } from "node:path";
import { projectKey } from "./identity.ts";
import type { ConversationLayout } from "./layout.types.ts";

export function claudeLayout(): ConversationLayout {
  const directory = (repository: string, home: string) =>
    join(home, ".claude", "projects", projectKey(resolve(repository)));
  const location = (id: string, repository: string, home: string) =>
    join(directory(repository, home), `${id}.jsonl`);
  return {
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
}
