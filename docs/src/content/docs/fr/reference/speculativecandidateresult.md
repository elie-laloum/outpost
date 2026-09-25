---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeCandidateResult**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom                 | Type                                                             | Présence  | Rôle                                                                             |
| ------------------- | ---------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `key`               | `string`                                                         | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `branch`            | `string`                                                         | Requis    | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `status`            | `"skipped" \| "failed" \| "cancelled" \| "rejected" \| "winner"` | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `directory`         | `string \| undefined`                                            | Optionnel | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `retainedDirectory` | `string \| undefined`                                            | Optionnel | Workspace conservé pour inspection ou récupération.                              |
| `result`            | `SpeculativeOutput<T> \| undefined`                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `error`             | `unknown`                                                        | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly branch: string;
  readonly status: "winner" | "rejected" | "failed" | "cancelled" | "skipped";
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}
```

## Contrats associés

- [SpeculativeOutput](../speculativeoutput/)
