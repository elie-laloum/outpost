---
title: "RecipeProjectSources"
description: "RecipeProjectSources — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectSources } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name     | Type                  | Presence | Meaning                                                                                                                           |
| -------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `recipe` | `string \| undefined` | Optional | Recipe YAML text read instead of the file named by \`file\`; diagnostics still name that file.                                    |
| `config` | `string \| undefined` | Optional | Configuration YAML text read instead of the file named by \`config\`; its directory still anchors repository and extension paths. |

## Signature

```ts
export interface RecipeProjectSources {
  readonly recipe?: string;
  readonly config?: string;
}
```
