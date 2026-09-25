---
title: "resourcePhases"
description: "resourcePhases — Outpost API"
sidebar:
  order: 10
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

List the lifecycle phases recorded in local sandbox activity files; ResourcePhase derives its allowed values from this constant.

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
