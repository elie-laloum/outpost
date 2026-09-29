---
title: "createLocalSandboxProvider"
description: "createLocalSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
```

## Purpose and behavior

Create an explicitly unisolated provider that executes commands on the host in the selected workspace. No container or VM is allocated; host filesystem access and credentials remain those of the calling process.

[Complete example and detailed rules](../../guide/host-process/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                       |
| ------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optional | Explicit environment variables for unisolated host execution. |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.        |

## Returns

`SandboxProvider`

## Signature

```ts
export declare function createLocalSandboxProvider(
  options?: LocalOptions,
): SandboxProvider;
```

## Related contracts

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
