---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                                                                                                                                                                      | Présence | Rôle                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; } \| Promise<{ readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; }>; }` | Requis   | Point d’entrée de validation Standard Schema ; validate renvoie une valeur typée ou des problèmes de validation, éventuellement de façon asynchrone. |

## Signature

```ts
export interface StandardValidator<T> {
  readonly "~standard": {
    readonly validate: (input: unknown) =>
      | {
          readonly value: T;
          readonly issues?: undefined;
        }
      | {
          readonly issues: readonly unknown[];
        }
      | Promise<
          | {
              readonly value: T;
              readonly issues?: undefined;
            }
          | {
              readonly issues: readonly unknown[];
            }
        >;
  };
}
```
