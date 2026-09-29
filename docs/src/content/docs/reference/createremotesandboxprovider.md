---
title: "createRemoteSandboxProvider"
description: "createRemoteSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Wrap a provider definition with remote placement, enabling application-managed repository upload and synchronization around the lease supplied by acquire.

[Complete example and detailed rules](../../guide/custom-sandbox-providers/).

## Parameters and properties

| Name         | Type                 | Presence | Meaning                                                                                            |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Required | Provider name, environment variables and acquire implementation to wrap with a placement contract. |

## Returns

`SandboxProvider`

## Signature

```ts
export declare const createRemoteSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Related contracts

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
