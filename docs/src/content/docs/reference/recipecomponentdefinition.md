---
title: "RecipeComponentDefinition"
description: "RecipeComponentDefinition — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeComponentDefinition } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name           | Type                                                                                                           | Presence | Meaning                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `name`         | `string`                                                                                                       | Required | Unique factory identifier in category.name form, such as sink.console.                                 |
| `kind`         | `string`                                                                                                       | Required | Category of the produced object; references must request this exact category.                          |
| `schema`       | `Readonly<Record<string, unknown>>`                                                                            | Required | Static JSON Schema for options; component annotations identify nested typed references.                |
| `experimental` | `boolean \| undefined`                                                                                         | Optional | Require experimental: true in local YAML before accepting this factory.                                |
| `create`       | `(options: Readonly<Record<string, unknown>>, context: RecipeComponentContext) => unknown \| Promise<unknown>` | Required | Construct the component after static validation; dependencies resolve through the context.             |
| `accepts`      | `(value: unknown) => boolean`                                                                                  | Required | Validate the runtime object returned by this factory or a local extension in the same category.        |
| `dispose`      | `((value: unknown) => void \| Promise<void>) \| undefined`                                                     | Optional | Release objects created by this factory after dependents; omitted for objects without owned resources. |

## Signature

```ts
export interface RecipeComponentDefinition {
  readonly name: string;
  readonly kind: string;
  readonly schema: JsonSchema;
  readonly experimental?: boolean;
  create(
    options: Readonly<Record<string, unknown>>,
    context: RecipeComponentContext,
  ): unknown | Promise<unknown>;
  accepts(value: unknown): boolean;
  dispose?(value: unknown): void | Promise<void>;
}
```

## Related contracts

- [JsonSchema](../jsonschema/)
- [RecipeComponentContext](../recipecomponentcontext/)
