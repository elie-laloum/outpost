---
title: "createMemorySandboxProvider"
description: "createMemorySandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";
```

## Purpose and behavior

Create a provider that simulates sandbox commands without starting an agent CLI or arbitrary subprocess. Scripted agent turns bypass the command queue; other invocations consume commands in order across all acquired leases, matching executable and arguments exactly. Unexpected commands throw code provider without consuming an entry. Git workspaces and scripted commits use the real host filesystem and Git. File transfers, terminals, live input and elevation are refused. Invocation honors cancellation, deadlines and output retention. Release cancels active work and is idempotent; no container or network isolation is provided.

[Complete example and detailed rules](../../guide/testing-workflows/).

## Parameters and properties

| Name               | Type                                    | Presence | Meaning                                                                                                                                                                              |
| ------------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`          | `MemorySandboxOptions \| undefined`     | Optional | Optional predefined command results. A fresh provider starts with an unconsumed command queue.                                                                                       |
| `options.commands` | `readonly MemoryCommand[] \| undefined` | Optional | Ordered queue of exact executable/argument matches and their simulated results, shared across leases of this provider. Defaults to empty; scripted agent requests do not consume it. |

## Returns

`SandboxProvider`

## Signature

```ts
export declare function createMemorySandboxProvider(
  options?: MemorySandboxOptions,
): SandboxProvider;
```

## Related contracts

- [MemorySandboxOptions](../memorysandboxoptions/)
- [SandboxProvider](../sandboxprovider/)
