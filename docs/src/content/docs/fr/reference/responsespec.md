---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResponseSpec**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom       | Type                           | Présence | Rôle                                                                             |
| --------- | ------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `tag`     | `string`                       | Requis   | Identifiant de balise de type XML.                                               |
| `repairs` | `number`                       | Requis   | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut.   |
| `read`    | `(text: string) => Promise<T>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
