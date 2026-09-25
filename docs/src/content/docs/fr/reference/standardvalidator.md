---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StandardValidator**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom         | Type                                                                                                                                                                                                                                                      | Présence | Rôle                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; } \| Promise<{ readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; }>; }` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
