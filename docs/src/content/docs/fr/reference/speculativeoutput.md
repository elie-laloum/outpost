---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeOutput**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                                             |
| ------------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `text`              | `string`              | Requis    | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `conversation`      | `string \| undefined` | Optionnel | Identité de conversation native disponible.                                      |
| `usage`             | `Usage`               | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `branch`            | `string`              | Requis    | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `directory`         | `string`              | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `commits`           | `readonly Commit[]`   | Requis    | Identités et sujets des commits Git collectés.                                   |
| `transcript`        | `string \| undefined` | Optionnel | Chemin hôte disponible du transcript capturé.                                    |
| `log`               | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retainedDirectory` | `string \| undefined` | Optionnel | Workspace conservé pour inspection ou récupération.                              |
| `turns`             | `readonly Turn[]`     | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `value`             | `T`                   | Requis    | Valeur typée produite ou consommée par ce contrat.                               |
| `completed`         | `boolean`             | Requis    | Indique si le marqueur de fin configuré a été détecté.                           |
| `completion`        | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Contrats associés

- [WarmDispatchResult](../warmdispatchresult/)
