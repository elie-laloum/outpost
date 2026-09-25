---
title: "mountedSandboxProvider"
description: "mountedSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { mountedSandboxProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Wrap a provider definition with mounted placement. The provider exposes the host workspace through a mount and supplies its own allocation and release implementation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name         | Type                 | Presence | Meaning                                                                                            |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Required | Provider name, environment variables and acquire implementation to wrap with a placement contract. |

## Returns

`SandboxProvider`

## Signature

```ts
export declare const mountedSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Related contracts

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
