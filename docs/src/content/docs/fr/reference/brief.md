---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type                                                                              | Présence          | Rôle                                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`   | `string \| undefined`                                                             | Selon la variante | Brief littéral envoyé tel quel à l’agent : aucune variable ni commande n’est développée.                                                                                                                                                                     |
| `file`   | `undefined \| string`                                                             | Selon la variante | Chemin d’un fichier modèle, résolu depuis le répertoire de travail du processus et lu avant chaque passe. Ses variables {{NAME}} sont remplies et chaque fragment !\`command\` est remplacé par la sortie standard de la commande, exécutée dans la sandbox. |
| `values` | `undefined \| Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optionnel         | Valeurs des variables {{NAME}} du fichier, insérées aussi sans échappement dans les commandes. WORK_BRANCH et BASE_BRANCH sont réservées ; une valeur absente échoue avec le code prompt et les valeurs inutilisées sont signalées à warn.                   |

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
