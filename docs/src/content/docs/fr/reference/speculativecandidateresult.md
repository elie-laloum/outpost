---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                             | Présence  | Rôle                                                                                                      |
| ------------------- | ---------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `key`               | `string`                                                         | Requis    | Clé unique du candidat reliant sa branche, sa validation et son résultat final.                           |
| `branch`            | `string`                                                         | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                    |
| `status`            | `"skipped" \| "failed" \| "cancelled" \| "rejected" \| "winner"` | Requis    | Résultat du candidat : winner, rejected, failed, cancelled ou skipped.                                    |
| `directory`         | `string \| undefined`                                            | Optionnel | Dossier hôte du workspace utilisé pour cette exécution.                                                   |
| `retainedDirectory` | `string \| undefined`                                            | Optionnel | Workspace conservé pour inspection ou récupération.                                                       |
| `result`            | `SpeculativeOutput<T> \| undefined`                              | Optionnel | Sortie de dispatch du candidat avec texte, commits, usage et valeur typée, sans méthodes de continuation. |
| `error`             | `unknown`                                                        | Optionnel | Échec d’origine rencontré pendant l’exécution, la validation d’un candidat ou le nettoyage de la course.  |

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
