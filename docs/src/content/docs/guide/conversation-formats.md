---
title: "Support a conversation format"
description: "Capture and restore the native sessions of a CLI agent you add to Outpost."
---

Add this only after the [CLI adapter](../custom-agents/) can identify and resume a session. Choose the helper matching the files the CLI actually writes; test capture and restoration against real session fixtures before advertising portable resume.

## Choose the storage format

A custom CLI adapter can expose its native session storage through `storage`. Outpost then uses it to capture conversations after turns, restore them in another sandbox and archive them through a transport. Choose the helper that matches how your CLI saves sessions.

| The CLI keeps                         | Building block                              | Built-in stores using it | Host copy                                   |
| ------------------------------------- | ------------------------------------------- | ------------------------ | ------------------------------------------- |
| One JSONL transcript per conversation | `createTranscriptConversations(layout)`     | Claude Code, Codex       | The path your layout returns                |
| One directory per session             | `createSessionBundleConversations(profile)` | Copilot, Kimi            | `.outpost/conversations/<format>/<id>.json` |

## Describe a transcript layout

The layout tells Outpost where the transcript lives on the host and in the sandbox. This adapter for a fictional `mycli` resumes with `--resume <id>` and reports its session ID in a `session` event.

<!-- tabs -->

```ts title="conversation-layout.ts"
import { join, basename, posix } from "node:path";
import type { TranscriptConversationLayout } from "@elie-laloum/outpost";

export const sessions = (home: string) => join(home, ".mycli", "sessions");
export const layout: TranscriptConversationLayout = {
  format: "mycli",
  sidecars: false,
  searchRoot: sessions,
  matches: (file, id) => basename(file) === `${id}.jsonl`,
  directory: (_repository, home) => sessions(home),
  capturePath: (id, _repository, home) => join(sessions(home), `${id}.jsonl`),
  remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
  pattern: (id) => `${id}.jsonl`,
  remotePath: (id, sandbox) =>
    posix.join(sandbox.home, ".mycli", "sessions", `${id}.jsonl`),
};
```

```ts title="conversation-events.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export function events(line: string): AgentEvent[] {
  const event = JSON.parse(line);
  if (event.session) return [{ kind: "conversation", id: event.session }];
  return [{ kind: "text", text: String(event.text ?? "") }];
}
```

```ts title="adapter.ts"
import type { AgentAdapter } from "@elie-laloum/outpost";
import { createTranscriptConversations } from "@elie-laloum/outpost";
import { layout } from "./conversation-layout.ts";
import { events } from "./conversation-events.ts";

export const adapter: AgentAdapter = {
  name: "mycli",
  resumable: true,
  storage: createTranscriptConversations(layout),
  request: ({ text, continuation }) => ({
    executable: "mycli",
    arguments: [
      "--json",
      ...(continuation ? ["--resume", continuation.id] : []),
    ],
    stdin: text ?? "",
  }),
  events,
};
```

```ts title="agent.ts"
import { createAgent } from "@elie-laloum/outpost";
import { adapter } from "./adapter.ts";

export const agent = createAgent({
  harness: { kind: "cli", bind: () => adapter },
});
```

Host functions receive your home directory, or `conversationHome` when you set it. `remoteSearchRoot` receives the agent home in the sandbox, and `remotePath` the `SandboxLease`.

API reference: [TranscriptConversationLayout](../../reference/transcriptconversationlayout/).

## Follow the workspace path

Transcripts record the directory the CLI ran in. Capture rewrites every `cwd` field equal to the first recorded `cwd` (or `payload.cwd`) to the host repository path. Restoration rewrites them to the workspace of the new sandbox, so the CLI resumes in the right directory.

## Pack a session directory

`createSessionBundleConversations()` packs a session directory into one JSON bundle. A Node.js script run in the sandbox does the packing; restoration unpacks the bundle in the new sandbox.

```ts
import { createSessionBundleConversations } from "@elie-laloum/outpost";

export const storage = createSessionBundleConversations({
  format: "mycli",
  root: { variable: "MYCLI_HOME", directory: ".mycli" },
  sessions: "sessions",
  include: /^(?:session\.json|events\.jsonl|files(?:\/|$))/,
  exclude: /\.lock$/,
  required: ["session.json", "events.jsonl"],
  relocated: ["session.json"],
  validate: (files, id) =>
    JSON.parse(files.text("session.json") ?? "null")?.id === id
      ? undefined
      : "Unsupported mycli session",
  relocate: (_path, text, { cwd }) =>
    JSON.stringify({ ...JSON.parse(text), cwd }),
});
console.log(storage.format);
// Example output: mycli
```

<!-- check:run -->

API reference: [SessionBundleProfile](../../reference/sessionbundleprofile/).

Restoration writes every file to a staging directory first. An existing session with the same ID moves to `.outpost-recovery/` in the CLI home before the new one takes its place.

## Write the in-sandbox functions

`validate`, `bucket` and `relocate` run in the sandbox from their source text, not in your process.

- **Expressions only**: Write an arrow function or a `function` expression. A method is rejected when the store is created.
- **Self-contained**: Use the arguments, `helpers.join`, `helpers.sha256` and JavaScript built-ins. An import or a variable from your module fails when the function runs.
- **Return values**: `validate` returns an error message or `undefined`. `relocate` returns the new text; throwing aborts the restoration and keeps the existing session.
- **Buckets**: `bucket` is required with `buckets: true`.

## Keep the format stable

`format` names the conversation records, the transport keys and the host directories. A store refuses to restore a record captured under another format, so renaming it strands earlier conversations.

Built-in presets accept a replacement store through their `conversations` option. Its `format` must match the agent (`"claude"`, `"codex"`…), otherwise the harness fails when created. A custom `ConversationStore` without `format` is accepted as is.

## Archive through a transport

Wrap the native store to archive every capture, as for a built-in agent: `createTransportConversations(storage, { transporter, namespace })`. [Conversations](../conversations/) shows the full setup with a shared transport.

## Limits

- **Bundle size**: A session bundle holds at most 64 MiB and 4,096 files.
- **Refused entries**: Symlinks, and files that change during capture, fail the capture with code `session`.
- **Node.js in the sandbox**: Session bundles run a Node.js script, so the sandbox image must provide `node`.
- **Regular expressions**: `include` and `exclude` cannot use the `g` or `y` flag.
- **Transcript files**: The host search and child transcripts only consider `.jsonl` files. A child transcript that fails to capture only logs a warning.
- **Transport**: `createTransportConversations()` needs a store with a `format`.
- **Conversation IDs**: Only letters, digits, `_` and `-` are accepted.

API: [createTranscriptConversations](../../reference/createtranscriptconversations/) · [TranscriptConversationLayout](../../reference/transcriptconversationlayout/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/) · [SessionBundleProfile](../../reference/sessionbundleprofile/) · [SessionBundleHelpers](../../reference/sessionbundlehelpers/) · [NativeConversationStore](../../reference/nativeconversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [AgentAdapter](../../reference/agentadapter/).
