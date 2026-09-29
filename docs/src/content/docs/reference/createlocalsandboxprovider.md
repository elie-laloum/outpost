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

Create an unisolated provider that runs commands as host processes in the worktree, with your home, environment, files and credentials. No container or VM is allocated. An egress option fails with code configuration.

[Complete example and detailed rules](../../guide/host-process/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                       |
| ------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optional | Explicit environment variables for unisolated host execution.                                                                 |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables added to host commands, as literal values. A key the agent also declares fails with code configuration. |

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
