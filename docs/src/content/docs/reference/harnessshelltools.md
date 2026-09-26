---
title: "harnessShellTools"
description: "harnessShellTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import { harnessShellTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the shell toolset: shell runs sh -c in the repository root with a deadline and no input, and reports the exit status, stdout and stderr. Requires a POSIX shell in the sandbox.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                 | Type                             | Presence | Meaning                                                                                                      |
| -------------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `options`            | `ShellToolsOptions \| undefined` | Optional | Optional shell settings such as the command deadline.                                                        |
| `options.deadlineMs` | `number \| undefined`            | Optional | Deadline of each shell command in milliseconds; defaults to 120,000. The harness tool deadline also applies. |

## Returns

`HarnessToolset`

## Signature

```ts
export declare function harnessShellTools(
  options?: ShellToolsOptions,
): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
- [ShellToolsOptions](../shelltoolsoptions/)
