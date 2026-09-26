---
title: "Chat history"
description: "Continue an agent conversation or branch from it."
---

Codex and Claude Code can capture native conversations. Continue one with `result.resume()` or create a separate conversation with `result.fork()`.

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

Disabling capture prevents the result from supplying a saved conversation for later restoration. Antigravity, Copilot and Kimi support fresh sessions only.

## Storage

`conversations()` manages native layouts; `harnessConversations()` stores the built-in loop’s transcripts. `transportConversations()` archives supported formats through a transport. Conversation restoration rewrites supported workspace paths when the transcript moves.

Keep transcript access separate from authentication. A saved conversation does not supply account credentials, and deleting credentials does not delete stored conversation content.

API: [DispatchResult](../../reference/dispatchresult/) · [ConversationStore](../../reference/conversationstore/) · [transportConversations](../../reference/transportconversations/).
