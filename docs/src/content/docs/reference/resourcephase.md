---
title: "ResourcePhase"
description: "ResourcePhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ResourcePhase } from "@elie-laloum/outpost";
```

## Purpose and behavior

Lifecycle phase of a sandbox in its resource activity record; the record is removed after a clean release. Values: "allocating" (provider acquisition in progress), "ready" (sandbox started), "closing" (release in progress), "cleanup-failed" (release or workspace cleanup failed; resources may remain), "allocation-uncertain" (startup failed before the provider returned a lease, so a sandbox may exist without an owner).

[Complete example and detailed rules](../../guide/recovery/).

## Signature

```ts
export type ResourcePhase = (typeof resourcePhases)[number];
```

## Related contracts

- [resourcePhases](../support-resourcephases/)
