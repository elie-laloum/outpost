---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationContext**. See the [conversations guide](../../guide/agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationContext } from "@elie-laloum/outpost";
```

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name         | Type                                       | Presence | Meaning                                                                 |
| ------------ | ------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `repository` | `string`                                   | Required | Target host Git checkout.                                               |
| `sandbox`    | `SandboxLease`                             | Required | See the linked contract and this family's rules for its interpretation. |
| `staging`    | `string`                                   | Required | See the linked contract and this family's rules for its interpretation. |
| `home`       | `string \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `local`      | `boolean \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation. |
| `warn`       | `((message: string) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ConversationContext {
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}
```

## Related contracts

- [SandboxLease](../sandboxlease/)
