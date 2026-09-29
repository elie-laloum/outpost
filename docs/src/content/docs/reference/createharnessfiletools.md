---
title: "createHarnessFileTools"
description: "createHarnessFileTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessFileTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the files toolset: read_file returns numbered lines of a UTF-8 file downloaded from the sandbox, and list_files lists files Git tracks or does not ignore. Both are read-only and declare their paths for permission rules.

[Complete example and detailed rules](../../guide/harness-tools/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessFileTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
