---
title: "changed"
description: "changed — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { changed } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare an immutable lifecycle condition over exact relative file paths, without reading files. The first preparation runs; reused sandboxes rerun the command before the next operation only when content or file existence differs from its last successful preparation. Fingerprints belong to each hook and sandbox and are never shared across new sandboxes.

[Complete example and detailed rules](../../guide/environment-setup/).

## Parameters and properties

| Name    | Type                | Presence | Meaning                                                                                                                                                                                                                                   |
| ------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files` | `readonly string[]` | Required | Nonempty unique list of exact relative file paths, resolved from the hook directory; rejects absolute paths, backslashes, empty segments and traversal. Content, creation and deletion participate in the fingerprint, timestamps do not. |

## Returns

`ChangedCondition`

## Signature

```ts
export declare function changed(files: readonly string[]): ChangedCondition;
```

## Related contracts

- [ChangedCondition](../changedcondition/)
