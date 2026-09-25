---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 10
---

Public contract for **DependencyCache**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { DependencyCache } from "@elie-laloum/outpost/providers/docker";
import type { DependencyCache } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                                 |
| ------ | -------- | -------- | ----------------------------------------------------------------------- |
| `name` | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `key`  | `string` | Required | Stable task or cache key within its owning contract.                    |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
