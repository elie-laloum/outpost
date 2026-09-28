---
title: "Chat history"
description: "Continue an agent conversation or branch from it."
---

Codex, Claude Code, Copilot and Kimi can capture native conversations. Fork is supported by Codex, Claude Code and Kimi. Continue one with `result.resume()` or create a separate conversation with `result.fork()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const next = await first.resume({
  sandboxProvider,
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
```

## Continuation choices

On an open sandbox use `sandbox.resume(id, options)` or `sandbox.fork(id, options)`. A cold result restores its captured conversation into a later environment. The conversation ID and transcript are distinct from the Git branch and workspace.

Disabling capture prevents the result from supplying a saved conversation for later restoration. Antigravity can resume only a conversation emitted in the same open sandbox; it rejects cold resume and automated fork. Copilot rejects automated fork.

## Storage

`conversations.native()` manages native layouts; `harnessConversations()` stores the built-in loop’s transcripts. `transportConversations()` archives supported formats through a transport. Conversation restoration rewrites supported workspace paths when the transcript moves.

Keep transcript access separate from authentication. A saved conversation does not supply account credentials, and deleting credentials does not delete stored conversation content.

Copilot and Kimi capture one JSON bundle per session under `.outpost/conversations/<format>/` in the repository (or under `conversationHome` when supplied). `conversations.native("copilot")`, `conversations.native("kimi")` and `transportConversations()` support these bundles. `transcript` points to the bundle, not a single JSONL history. Capture is limited to 64 MiB of file data and 4,096 files; missing required files, symlinks and unsupported metadata fail explicitly. Restoration stages and validates all files before replacing an existing session, retaining the previous directory under the CLI home’s `.outpost-recovery/`.

Kimi capture excludes diagnostic logs, background tasks, cron jobs, notifications and lock files. It restores conversation state, not running processes or schedules. A Kimi session already present under another workspace in the destination home is refused; use a private sandbox home for portable continuation. Agent credentials and custom tool/model configuration must still be supplied separately. Local execution shares the host’s native session store; restoring there can relocate session metadata.

API: [DispatchResult](../../reference/dispatchresult/) · [ConversationStore](../../reference/conversationstore/) · [transportConversations](../../reference/transportconversations/).
