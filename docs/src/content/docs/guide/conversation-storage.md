---
title: "Store and share conversations"
description: "Retain captured conversations and archive them through a transport."
---

Start from [conversations](../conversations/) and its configuration. Retain captured conversations and archive them through a transport.

## Where conversations are stored

After each turn, Outpost copies the conversation from the sandbox to the host. `result.transcript` holds the path of that copy.

| Agent            | Default store                  | Host location                               |
| ---------------- | ------------------------------ | ------------------------------------------- |
| Claude Code      | `createClaudeConversations()`  | `~/.claude/projects/<project>/<id>.jsonl`   |
| Codex            | `createCodexConversations()`   | `~/.codex/sessions/<yyyy>/<mm>/<dd>/`       |
| Copilot CLI      | `createCopilotConversations()` | `.outpost/conversations/copilot/<id>.json`  |
| Kimi Code        | `createKimiConversations()`    | `.outpost/conversations/kimi/<id>.json`     |
| Built-in harness | `createHarnessConversations()` | `.outpost/conversations/harness/<id>.jsonl` |

Copilot and Kimi keep a session as a directory: Outpost packs it into one JSON bundle. The `conversationHome` option of `dispatch()` or `createSandbox()` replaces `~`, or the repository for bundles, as the root of these paths.

Restoring rewrites the repository paths recorded in the conversation to those of the new sandbox. To give a CLI you add its own store, see [Native conversation formats](../conversation-formats/).

## Archive and share through a transport

`createTransportConversations()` wraps an agent’s store and also archives each capture through a [transport](../storage/). A conversation then resumes on another machine, or after the repository’s `.outpost` directory is deleted.

```ts
import {
  createAgent,
  createCodexConversations,
  createCodexHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost";

const conversations = createTransportConversations(createCodexConversations(), {
  transporter: createLocalTransport({ directory: "/mnt/shared/outpost" }),
  namespace: "my-project",
});

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account", conversations }),
});
```

<!-- features -->

- **Matching format**: Wrap the store of the same agent, such as `createHarnessConversations()` for `createHarness()`. A mismatch fails when the harness is created.
- **Stable namespace**: Use one project name on every machine that shares these conversations.
- **Shared transport**: Use [S3 or R2](../object-storage/) between hosts; a local transport coordinates writers on one machine only.

`result.transcriptReference` identifies the archived copy. The Claude Code, Codex, Copilot and Kimi presets and `createHarness()` accept `conversations`.

## Turn capture off

`saveConversations: false` on Claude Code or Codex keeps conversations inside the sandbox: only a warm resume can continue them. `conversations: false` on `createHarness()` saves no transcript and rejects resume, fork and response repairs. Copilot and Kimi always capture.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    saveConversations: false,
  }),
});
```
