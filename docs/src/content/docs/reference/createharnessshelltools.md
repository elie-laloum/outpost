---
title: "createHarnessShellTools"
description: "createHarnessShellTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessShellTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the shell toolset: shell runs sh -c in the repository root with empty input and a deadline, 120000 ms by default, and returns the exit status, stdout and stderr; a nonzero status is an error result. It declares the command for permission rules and needs a POSIX shell in the sandbox.

[Complete example and detailed rules](../../guide/harness-tools/).

## Parameters and properties

| Name                 | Type                             | Presence | Meaning                                                                                                           |
| -------------------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `options`            | `ShellToolsOptions \| undefined` | Optional | Shell settings: the deadline of each command.                                                                     |
| `options.deadlineMs` | `number \| undefined`            | Optional | Deadline of each shell command, default 120000 (2 minutes). toolExecution.deadlineMs still bounds the whole call. |

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessShellTools(
  options?: ShellToolsOptions,
): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
- [ShellToolsOptions](../shelltoolsoptions/)
