---
title: "relocateTranscript"
description: "relocateTranscript — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                 |
| ------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `text`        | `string`              | Required | Text content; see the owning operation for its source.                  |
| `destination` | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `source`      | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Returns

`string`

## Signature

```ts
export declare function relocateTranscript(
  text: string,
  destination: string,
  source?: string,
): string;
```
