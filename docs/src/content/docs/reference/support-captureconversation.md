---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name            | Type                                       | Presence | Meaning                                                                                  |
| --------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `format`        | `ConversationFormat`                       | Required | See the linked contract and this family's rules for its interpretation.                  |
| `id`            | `string`                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `repository`    | `string`                                   | Required | Target host Git checkout.                                                                |
| `lease`         | `SandboxLease`                             | Required | See the linked contract and this family's rules for its interpretation.                  |
| `staging`       | `string`                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options`       | `CaptureOptions \| undefined`              | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.home`  | `string \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.warn`  | `((message: string) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.local` | `boolean \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation.                  |

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
