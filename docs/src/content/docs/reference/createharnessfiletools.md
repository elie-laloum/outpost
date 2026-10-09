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

Create the files toolset. read_file returns up to 2000 numbered lines of a UTF-8 file and refuses symbolic links, binary files and files over 4 MiB; list_files lists up to 1000 files that Git tracks or does not ignore. Both are read-only and declare their paths for permission rules.

[Complete example and detailed rules](../../guide/harness-tools/).

## Parameters and properties

| Name                | Type                                 | Presence | Meaning                                                                                                              |
| ------------------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `options`           | `FileSelectionOptions \| undefined`  | Optional | Options selecting source, execution capabilities or inspected recovery preconditions for this operation.             |
| `options.selection` | `"git" \| "filesystem" \| undefined` | Optional | Defaults to git for legacy calls; filesystem performs bounded sandbox traversal without Git or .gitignore filtering. |

## Returns

`HarnessToolset`

## Signature

```ts
export declare function createHarnessFileTools(
  options?: FileSelectionOptions,
): HarnessToolset;
```

## Related contracts

- [FileSelectionOptions](../fileselectionoptions/)
- [HarnessToolset](../harnesstoolset/)
