---
title: "Capture, resume and fork"
description: "Capture, resume and fork — Outpost"
sidebar:
  order: 7
---

Native conversation capture is enabled by default. The transcript is copied to the agent’s host storage and working-directory fields are rewritten so native host resumption targets the right repository.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

const first = await dispatch({
  agent: codex(),
  brief: { text: "Inspect the validation code." },
});
await first.resume({ brief: { text: "Now add focused tests." } });
await first.fork({
  brief: { text: "Explore an alternative implementation." },
  branch: { mode: "named", name: "experiment/alternative" },
});
```

## Continuation choices

- A cold result’s `resume`/`fork` accepts new provider, branch and hook settings.
- A warm result retains its sandbox configuration and accepts dispatch options only.
- `sandbox.resume(id, options)` and `sandbox.fork(id, options)` use a known conversation.
- `continuation: { id, fork: true }` expresses a fork directly in dispatch or attachment.

Continuations require one pass. Cold dispatch checks that the host transcript exists before allocating an environment. Warm operations use a session already present or restore it from host storage. Fork creates a new conversation identity; use a separate branch/workspace for filesystem isolation.

## Storage and capture failures

`conversationHome` is the host directory containing `.claude` or `.codex`, defaulting to the OS home. Set `saveConversations: false` on the adapter to opt out of automatic capture. Without a captured/restorable transcript, cold continuation may fail.

Main-transcript capture failures fail the dispatch. Claude child transcript capture is best effort and warns on failure. Native transcripts may contain private prompts, output and source code.

The [conversations helper](../../reference/conversations/) exposes `native`, `locate`, `capture`, `restore`, `rewrite`, `projectKey`, `claudePath`, `directory` and `destination` for integrations. See [custom conversation stores](../../extend/conversations/) before implementing alternative storage.
