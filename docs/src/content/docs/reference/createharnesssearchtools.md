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

Create the search toolset: search runs git grep with an extended regular expression over tracked and non-ignored files and returns bounded path:line:text matches.

[Complete example and detailed rules](../../guide/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessSearchTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
