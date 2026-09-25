---
title: "remotePath"
description: "remotePath — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Compute the native transcript path inside a sandbox lease from the format and conversation ID, using the lease’s home and workspace path.

## Parameters and properties

| Name       | Type                 | Presence | Meaning                                                                                  |
| ---------- | -------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `format`   | `ConversationFormat` | Required | Native transcript layout: claude or codex.                                               |
| `id`       | `string`             | Required | Native conversation identifier used to locate or continue the session.                   |
| `lease`    | `SandboxLease`       | Required | Sandbox execution lease used to access the native agent home and transfer transcripts.   |
| `original` | `string`             | Required | Original native transcript filename, when needed to preserve the Codex session filename. |

## Returns

`string`

## Signature

```ts
export declare function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [SandboxLease](../sandboxlease/)
