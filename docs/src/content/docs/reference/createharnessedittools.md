---
title: "createHarnessEditTools"
description: "createHarnessEditTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessEditTools } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the edit toolset: write_file creates or replaces a file, and edit_file replaces exact text, keeps line endings and permissions and refuses to overwrite a file that changed during the edit.

[Complete example and detailed rules](../../guide/harness/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessEditTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
