---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StandardValidator**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

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
