---
title: "Native conversation formats"
description: "Give an external CLI native conversation capture and resume."
---

An external CLI gets native capture, cold resume and transport archiving by returning a native store as `storage`. Two building blocks cover the usual layouts; the built-in Claude, Codex, Copilot and Kimi stores are made from them.

`createTranscriptConversations()` handles CLIs that keep one JSONL transcript per conversation. The layout tells Outpost where to find the transcript on the host and in the sandbox:

```ts
import { basename, join, posix } from "node:path";
import {
  createAgent,
  createTranscriptConversations,
  type AgentAdapter,
} from "@elie-laloum/outpost";

const sessions = (home: string) => join(home, ".mycli", "sessions");

const adapter: AgentAdapter = {
  name: "mycli",
  resumable: true,
  storage: createTranscriptConversations({
    format: "mycli",
    sidecars: false,
    searchRoot: sessions,
    remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
    pattern: (id) => `${id}.jsonl`,
    matches: (file, id) => basename(file) === `${id}.jsonl`,
    directory: (_repository, home) => sessions(home),
    capturePath: (id, _repository, home) => join(sessions(home), `${id}.jsonl`),
    remotePath: (id, sandbox) =>
      posix.join(sandbox.home, ".mycli", "sessions", `${id}.jsonl`),
  }),
  request: ({ text, continuation }) => ({
    executable: "mycli",
    arguments: [
      "--json",
      ...(continuation ? ["--resume", continuation.id] : []),
    ],
    stdin: text ?? "",
  }),
  events: (line) => {
    const event = JSON.parse(line);
    if (event.session) return [{ kind: "conversation", id: event.session }];
    return [{ kind: "text", text: String(event.text ?? "") }];
  },
};

export const agent = createAgent({
  harness: { kind: "cli", bind: () => adapter },
});
```

Capture and restoration rewrite recorded `cwd` values that equal the original workspace, so the transcript follows the repository into another sandbox.

`createSessionBundleConversations()` handles CLIs that keep each session as a directory. Its profile names the CLI home and session directory, selects files with regular expressions and lists the files a session cannot lack. A script run inside the sandbox packs the session into one JSON bundle, limited to 64 MiB and 4,096 files, and refuses symlinks and files that change during capture. Restoration stages every file and keeps any previous session under `.outpost-recovery/`.

`validate`, `bucket` and `relocate` run inside the sandbox from their source text. Write them as self-contained arrow or function expressions: they cannot use imports or variables from your module, only their arguments and the `helpers` Outpost passes. A method or a regular expression with the `g` or `y` flag is rejected when the store is created; a reference to an outer variable fails when a session is captured.

Keep `format` stable once conversations are captured: it names conversation records, transport keys and bundle directories. Wrap the store with `createTransportConversations()` to archive it like a built-in format.
