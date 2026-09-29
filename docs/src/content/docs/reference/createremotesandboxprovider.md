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

Build a SandboxProvider with placement remote from a name, variables and acquire(). Outpost uploads the repository history to the lease root, installs a missing agent CLI and synchronizes changes back without overwriting concurrent host edits. A blank name fails with code configuration.

[Complete example and detailed rules](../../guide/custom-sandbox-providers/).

## Parameters and properties

| Name         | Type                 | Presence | Meaning                                                                                     |
| ------------ | -------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Required | Name, optional variables and acquire() of your provider; the factory adds placement remote. |

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
