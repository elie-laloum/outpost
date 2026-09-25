---
title: "local"
description: "local — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { local } from "@elie-laloum/outpost/providers/local";
```

## Purpose and behavior

Create an explicitly unisolated provider that executes commands on the host in the selected workspace. No container or VM is allocated; host filesystem access and credentials remain those of the calling process.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                       |
| ------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optional | Explicit environment variables for unisolated host execution. |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.        |

## Returns

`SandboxProvider`

## Signature

```ts
export declare function local(options?: LocalOptions): SandboxProvider;
```

## Related contracts

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
