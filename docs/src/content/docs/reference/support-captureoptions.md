---
title: "CaptureOptions"
description: "CaptureOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name    | Type                                       | Presence | Meaning                                                                 |
| ------- | ------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `home`  | `string \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `warn`  | `((message: string) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `local` | `boolean \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type CaptureOptions = {
  home?: string;
  warn?: (message: string) => void;
  local?: boolean;
};
```
