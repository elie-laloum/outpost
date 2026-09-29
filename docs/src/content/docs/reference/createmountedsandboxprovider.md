---
title: "createMountedSandboxProvider"
description: "createMountedSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createMountedSandboxProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build a SandboxProvider with placement mounted from a name, variables and acquire(). Your acquire() exposes context.directory and context.gitDirectories in the environment, so the agent edits the host worktree directly. A blank name fails with code configuration.

[Complete example and detailed rules](../../guide/custom-sandbox-providers/).

## Parameters and properties

| Name         | Type                 | Presence | Meaning                                                                                      |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Required | Name, optional variables and acquire() of your provider; the factory adds placement mounted. |

## Returns

`SandboxProvider`

## Signature

```ts
export declare const createMountedSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Related contracts

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
