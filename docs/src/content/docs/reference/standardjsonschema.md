---
title: "StandardJsonSchema"
description: "StandardJsonSchema — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { StandardJsonSchema } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                     | Presence | Meaning                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly issues: readonly unknown[]; } \| { readonly value: Input; readonly issues?: undefined; } \| Promise<{ readonly issues: readonly unknown[]; } \| { readonly value: Input; readonly issues?: undefined; }>; } & { readonly jsonSchema: { input(options: { readonly target: string; }): Record<string, unknown>; }; }` | Required | Standard Schema properties: validate() checks a value and jsonSchema.input() converts the input type to JSON Schema. |

## Signature

```ts
export interface StandardJsonSchema<Input> {
  readonly "~standard": StandardValidator<Input>["~standard"] & {
    readonly jsonSchema: {
      input(options: { readonly target: string }): Record<string, unknown>;
    };
  };
}
```

## Related contracts

- [StandardValidator](../standardvalidator/)
