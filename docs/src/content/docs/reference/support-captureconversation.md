---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Copy a native transcript from the sandbox lease into host staging and return its location when available. Capture can report warnings through options.warn; it does not export credentials.

## Parameters and properties

| Name            | Type                                       | Presence | Meaning                                                                                |
| --------------- | ------------------------------------------ | -------- | -------------------------------------------------------------------------------------- |
| `format`        | `ConversationFormat`                       | Required | Native transcript layout: claude or codex.                                             |
| `id`            | `string`                                   | Required | Native conversation identifier used to locate or continue the session.                 |
| `repository`    | `string`                                   | Required | Target host Git checkout.                                                              |
| `lease`         | `SandboxLease`                             | Required | Sandbox execution lease used to access the native agent home and transfer transcripts. |
| `staging`       | `string`                                   | Required | Host directory used to stage native transcript files during transfer.                  |
| `options`       | `CaptureOptions \| undefined`              | Optional | Host transcript home, local access mode and nonfatal warning callback.                 |
| `options.home`  | `string \| undefined`                      | Optional | Host agent home used to locate or persist native transcripts.                          |
| `options.warn`  | `((message: string) => void) \| undefined` | Optional | Callback receiving nonfatal execution or conversation-storage warnings.                |
| `options.local` | `boolean \| undefined`                     | Optional | Use host-local transcript access instead of transferring through the sandbox lease.    |

## Returns

`Promise<ConversationLocation>`

## Signature

```ts
export declare function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options?: CaptureOptions,
): Promise<ConversationLocation>;
```

## Related contracts

- [CaptureOptions](../support-captureoptions/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
