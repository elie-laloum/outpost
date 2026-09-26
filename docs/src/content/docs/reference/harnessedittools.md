---
title: "harnessEditTools"
description: "harnessEditTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { harnessEditTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the edit toolset: write_file creates or replaces a file, and edit_file replaces exact text, keeps line endings and permissions and refuses to overwrite a file that changed during the edit.

[Complete example and detailed rules](../../guide/agents/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function harnessEditTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
