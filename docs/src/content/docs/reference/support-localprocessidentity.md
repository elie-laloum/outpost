---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                 |
| ----------- | -------- | -------- | ----------------------------------------------------------------------- |
| `host`      | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `boot`      | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `namespace` | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `started`   | `string` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
