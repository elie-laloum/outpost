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

Create the edit toolset. write_file creates or replaces a UTF-8 file; edit_file replaces text that must appear exactly once unless replace_all is set, keeps line endings and the file mode, and returns an error without writing when the file changed during the edit. Both declare their paths for permission rules and run one at a time.

[Complete example and detailed rules](../../guide/harness-tools/).

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessEditTools(): HarnessToolset;
```

## Related contracts

- [HarnessToolset](../harnesstoolset/)
