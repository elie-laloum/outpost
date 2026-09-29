---
title: "createHarnessGitTools"
description: "createHarnessGitTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessGitTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the git toolset: git runs a status, diff, log or show command and refuses --output, --ext-diff, --textconv and --open-files-in-pager. It is read-only and declares the command line git &lt;command> &lt;arguments> for permission rules.

[Complete example and detailed rules](../../guide/harness-tools/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessGitTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
