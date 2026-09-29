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

`conversations.native()` manages native layouts; `createHarnessConversations()` stores the built-in loop’s transcripts. `createTransportConversations()` archives supported formats through a transport. Conversation restoration rewrites supported workspace paths when the transcript moves.

Pass `conversations` to `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` or `createHarness()` to capture that agent’s sessions in any `ConversationStore` instead of the default native store:

```ts
import {
  createAgent,
  createKimiHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost";

const conversations = createTransportConversations("kimi", {
  transporter: createLocalTransport({ directory: "/mnt/shared/outpost" }),
  namespace: "my-project",
});

export const coder = createAgent({
  harness: createKimiHarness({ authentication: "account", conversations }),
});
```

A session captured by one dispatch can then be resumed, or forked with Kimi, from another machine or after the repository’s local `.outpost` directory is removed. Use a `createS3Transport()` to share it between hosts. The store’s `format` must match the agent: `createTransportConversations("kimi", …)` for Kimi, `"harness"` for `createHarness()`. A mismatched format, a value that is not a store, or `saveConversations: false` combined with `conversations` fails when the harness is created, before any sandbox is allocated. A custom store without `format` is accepted as is. Without the option, each agent keeps its native store. `createAntigravityHarness()` rejects `conversations` because Antigravity has no portable capture.

Archived conversations contain prompts, repository content and tool output. Outpost does not encrypt or authenticate them; restrict access to the transport as you would to the repository.

Keep transcript access separate from authentication. A saved conversation does not supply account credentials, and deleting credentials does not delete stored conversation content.

Copilot and Kimi capture one JSON bundle per session under `.outpost/conversations/<format>/` in the repository (or under `conversationHome` when supplied). `conversations.native("copilot")`, `conversations.native("kimi")` and `createTransportConversations()` support these bundles. `transcript` points to the bundle, not a single JSONL history. Capture is limited to 64 MiB of file data and 4,096 files; missing required files, symlinks and unsupported metadata fail explicitly. Restoration stages and validates all files before replacing an existing session, retaining the previous directory under the CLI home’s `.outpost-recovery/`.

Kimi capture excludes diagnostic logs, background tasks, cron jobs, notifications and lock files. It restores conversation state, not running processes or schedules. A Kimi session already present under another workspace in the destination home is refused; use a private sandbox home for portable continuation. Agent credentials and custom tool/model configuration must still be supplied separately. Local execution shares the host’s native session store; restoring there can relocate session metadata.

API: [DispatchResult](../../reference/dispatchresult/) · [ConversationStore](../../reference/conversationstore/) · [createTransportConversations](../../reference/createtransportconversations/).
