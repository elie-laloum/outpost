---
title: "StandardJsonSchema"
description: "StandardJsonSchema — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StandardJsonSchema } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                                                                                                                                                                                                                                                                                     | Présence | Rôle                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly issues: readonly unknown[]; } \| { readonly value: Input; readonly issues?: undefined; } \| Promise<{ readonly issues: readonly unknown[]; } \| { readonly value: Input; readonly issues?: undefined; }>; } & { readonly jsonSchema: { input(options: { readonly target: string; }): Record<string, unknown>; }; }` | Requis   | Propriétés Standard Schema : validate() contrôle une valeur et jsonSchema.input() convertit le type d’entrée en JSON Schema. |

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

## Contrats associés

- [StandardValidator](../standardvalidator/)
