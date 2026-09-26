---
title: "harnessFileTools"
description: "harnessFileTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { harnessFileTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the files toolset: read_file returns numbered lines of a UTF-8 file downloaded from the sandbox, and list_files lists files Git tracks or does not ignore. Both are read-only and declare their paths for permission rules.

[Complete example and detailed rules](../../guide/agents/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function harnessFileTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
