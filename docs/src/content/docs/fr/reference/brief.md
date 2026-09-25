---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Brief**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom      | Type                                                                 | Présence  | Rôle                                                                             |
| -------- | -------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `text`   | `string \| undefined`                                                | Optionnel | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `file`   | `string \| undefined`                                                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `values` | `Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type Brief =
  | {
      readonly text: string;
      readonly file?: never;
      readonly values?: never;
    }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };
```

## Contrats associés

- [PromptVariables](../promptvariables/)
