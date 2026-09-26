---
title: "harnessGitTools"
description: "harnessGitTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { harnessGitTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the git toolset: git runs read-only status, diff, log or show commands and refuses options that write files or run external programs.

[Complete example and detailed rules](../../guide/agents/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function harnessGitTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
