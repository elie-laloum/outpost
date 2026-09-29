---
title: "ResourceOperationKind"
description: "ResourceOperationKind — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ResourceOperationKind } from "@elie-laloum/outpost";
```

## Purpose and behavior

Kind of sandbox operation counted in a resource activity record. Values: "dispatch", "attach", "diagnose", "command" (exclusive Sandbox operations of the same name), "invoke" (a lease command), "upload", "download" (single transfers), "manifest", "upload-batch", "download-batch" (batch transfer steps).

[Complete example and detailed rules](../../guide/recovery/).

## Signature

```ts
export type ResourceOperationKind = (typeof resourceOperationKinds)[number];
```

## Related contracts

- [resourceOperationKinds](../support-resourceoperationkinds/)
