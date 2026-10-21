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

Claude and Codex also honor the host's `CLAUDE_CONFIG_DIR` and `CODEX_HOME` for default storage. An explicit `conversationHome` takes precedence for captured copies. With local execution, capture and restore use the configuration directory visible to the CLI, including declared environment overrides. Isolated sandboxes keep their own native storage paths; host overrides do not redirect them.

Restoring rewrites the repository paths recorded in the conversation to those of the new sandbox. To give a CLI you add its own store, see [Native conversation formats](../conversation-formats/).

Codex keeps the date encoded in the original rollout filename when capturing and restoring it. If several transcripts match the same conversation without a preferred native path, lookup and capture fail explicitly. Inspect and reconcile those copies before resuming; Outpost does not choose one by filesystem traversal order.

Local capture leaves the CLI’s original transcript and its subagent files intact. If the capture destination is that same file and `redact` is enabled, `result.transcript` points to a masked copy under `.outpost/conversations/native/`; native continuation in that workspace keeps using the original. A separate destination, including the relocated host copy for another worktree, an explicit `conversationHome` or a transport, still receives the captured and optionally masked copy.

## Archive and share through a transport

`createTransportConversations()` wraps an agent’s store and also archives each capture through a [transport](../storage/). A conversation then resumes on another machine, or after the repository’s `.outpost` directory is deleted.

```ts
import {
  createAgent,
  createCodexHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost/core";
import { createCodexConversations } from "@elie-laloum/outpost/integrations";

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
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost/core";

export const reviewer = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    saveConversations: false,
  }),
});
```
