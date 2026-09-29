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

Create the git toolset: git runs read-only status, diff, log or show commands and refuses options that write files or run external programs.

[Complete example and detailed rules](../../guide/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessGitTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
