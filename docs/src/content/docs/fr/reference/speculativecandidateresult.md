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

| Nom                 | Type                                                                        | Présence  | Rôle                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`               | `string`                                                                    | Requis    | Clé unique du candidat reliant sa branche, sa validation et son résultat final.                                                            |
| `commit`            | `string \| undefined`                                                       | Optionnel | HEAD candidat capturé après validation réussie ; la vérification d’intégration refuse une modification ultérieure de la référence.         |
| `attempt`           | `number \| undefined`                                                       | Optionnel | Numéro de tentative à partir de un ; un rejeu utilise une nouvelle branche et consomme une tentative supplémentaire du budget partagé.     |
| `cleanup`           | `"done" \| "pending" \| undefined`                                          | Optionnel | done confirme la fin du nettoyage possédé ; pending exige une réconciliation des ressources et conserve les informations de récupération.  |
| `resourceId`        | `string \| undefined`                                                       | Optionnel | Identité du provider enregistrée avant l’allocation, utilisée pour le nettoyage explicite après échec du coordinateur.                     |
| `branch`            | `string`                                                                    | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                     |
| `status`            | `"failed" \| "quota" \| "skipped" \| "cancelled" \| "rejected" \| "winner"` | Requis    | Résultat du candidat : winner, rejected, failed, quota (arrêté par une limite d’usage ou de débit), cancelled ou skipped.                  |
| `quota`             | `QuotaFault \| undefined`                                                   | Optionnel | Limite d’usage ou de débit ayant arrêté ce candidat ; la reprise durable relance ces candidats en nouvelles tentatives depuis la baseline. |
| `directory`         | `string \| undefined`                                                       | Optionnel | Dossier hôte du workspace utilisé pour cette exécution.                                                                                    |
| `retainedDirectory` | `string \| undefined`                                                       | Optionnel | Workspace conservé pour inspection ou récupération.                                                                                        |
| `result`            | `SpeculativeOutput<T> \| undefined`                                         | Optionnel | Sortie de dispatch du candidat avec texte, commits, usage et valeur typée, sans méthodes de continuation.                                  |
| `error`             | `unknown`                                                                   | Optionnel | Échec d’origine rencontré pendant l’exécution, la validation d’un candidat ou le nettoyage de la course.                                   |

## Signature

```ts
export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly commit?: string;
  readonly attempt?: number;
  readonly cleanup?: "pending" | "done";
  readonly resourceId?: string;
  readonly branch: string;
  readonly status:
    "winner" | "rejected" | "failed" | "quota" | "cancelled" | "skipped";
  /** Usage or rate limit that stopped this candidate. */
  readonly quota?: QuotaFault;
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}
```

## Contrats associés

- [QuotaFault](../type-quotafault/)
- [SpeculativeOutput](../speculativeoutput/)
