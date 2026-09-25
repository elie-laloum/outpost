---
title: "resourcePhases"
description: "resourcePhases — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Signature

```ts
export declare const resourcePhases: readonly [
  "allocating",
  "ready",
  "closing",
  "cleanup-failed",
  "allocation-uncertain",
];
```
