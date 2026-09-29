---
title: "createHarnessSearchTools"
description: "createHarnessSearchTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessSearchTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the search toolset: search runs git grep with an extended regular expression over tracked and non-ignored text files and returns path:line:text matches, 200 at most per call. It is read-only and declares its path for permission rules.

[Complete example and detailed rules](../../guide/harness-tools/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessSearchTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
