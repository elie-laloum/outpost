---
title: "Custom conversation stores"
description: "Custom conversation stores — Outpost"
sidebar:
  order: 3
---

`ConversationStore` separates native transcript handling from command/event adaptation. Implement it when an agent uses another layout or when native storage needs a different backend.

| Method                          | Responsibility                                                               |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `locate(id, repository, home?)` | Find an existing host transcript and return `{ id, file, format }`.          |
| `capture(id, context)`          | Transfer the authoritative transcript to host storage and return its record. |
| `restore(record, context)`      | Make that transcript available to the target environment for continuation.   |

`ConversationContext` includes `repository`, the sandbox lease, a `staging` directory, optional host `home`, `local` placement information and a warning callback. Use the lease for remote file access rather than assuming host filesystem paths are valid inside the environment.

Assign the store to `AgentAdapter.storage`. Built-in layouts are available through `conversations.native("claude")` and `conversations.native("codex")`. The public helper also exposes low-level discovery, capture, restoration and path rewriting; consult its [exact signatures](../../../../reference/conversations/) before calling them.

Rewrite only structural working-directory metadata, not arbitrary user text that happens to contain a path. Preserve conversation identity on resume and let the native agent create a new identity for fork. Validate IDs before using them as path fragments.

Test host-to-sandbox round trips, custom home directories, nested child transcripts, absent files and interrupted transfers. A store should fail clearly when the authoritative transcript cannot be captured; a warning is appropriate only for optional auxiliary material.
