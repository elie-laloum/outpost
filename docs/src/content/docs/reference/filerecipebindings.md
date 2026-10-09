---
title: "FileRecipeBindings"
description: "FileRecipeBindings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileRecipeBindings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                   | Presence | Meaning                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `FileSandbox`                                          | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                                                                                                     |
| `inputs`  | `Readonly<Record<string, WorkflowJson>> \| undefined`  | Optional | Declared recipe input values; format 3 also accepts lossless JSON objects, arrays and null. Inputs are validated before tasks run.                                                                                                |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optional | Composed Outpost agents keyed by the exact names used in YAML agent fields. Missing names are rejected at declaration; command-only recipes may omit this registry. Authentication and model choices stay in the composed agents. |

## Signature

```ts
export interface FileRecipeBindings extends Omit<RecipeBindings, "sandbox"> {
  readonly sandbox: FileSandbox;
}
```

## Related contracts

- [FileSandbox](../filesandbox/)
- [RecipeBindings](../recipebindings/)
