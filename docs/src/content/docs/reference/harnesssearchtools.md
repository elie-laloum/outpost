---
title: "harnessSearchTools"
description: "harnessSearchTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import { harnessSearchTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the search toolset: search runs git grep with an extended regular expression over tracked and non-ignored files and returns bounded path:line:text matches.

[Complete example and detailed rules](../../guide/agents/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function harnessSearchTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
