---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`               | `string`                                                                    | Requis    | Clé du candidat.                                                                                                                                                                                                                                                                           |
| `commit`            | `string \| undefined`                                                       | Optionnel | HEAD du candidat lu après le retour de validate, commits de validation compris. checkSpeculationIntegration() bloque si la branche bouge ensuite.                                                                                                                                          |
| `attempt`           | `number \| undefined`                                                       | Optionnel | Numéro de tentative à partir de un ; un rejeu utilise une nouvelle branche et consomme une tentative supplémentaire du budget partagé.                                                                                                                                                     |
| `cleanup`           | `"done" \| "pending" \| undefined`                                          | Optionnel | done une fois la sandbox fermée ; pending si la fermeture a échoué ou dépassé cleanupMs. Une course durable reste alors possédée, et son appel suivant arrête d’abord la ressource.                                                                                                        |
| `resourceId`        | `string \| undefined`                                                       | Optionnel | Ressource enregistrée par le provider avant l’allocation de la sandbox, par exemple un nom de conteneur ; courses durables uniquement. L’appel suivant s’en sert pour arrêter une sandbox orpheline.                                                                                       |
| `branch`            | `string`                                                                    | Requis    | Branche du candidat : outpost/speculation/&lt;id>/&lt;key>, ou …/&lt;key>/&lt;attempt> dans une course durable. Elle reste dans le dépôt.                                                                                                                                                  |
| `status`            | `"failed" \| "quota" \| "cancelled" \| "rejected" \| "skipped" \| "winner"` | Requis    | winner ; rejected si validate a renvoyé false ou qu’un autre candidat a gagné avant ; failed si l’allocation, l’agent, validate ou le nettoyage a levé une erreur ; quota ; cancelled par un gagnant, une limite de tokens, votre signal ou un plantage ; skipped s’il n’a jamais démarré. |
| `quota`             | `QuotaFault \| undefined`                                                   | Optionnel | Limite d’usage ou de débit ayant arrêté ce candidat ; la reprise durable relance ces candidats en nouvelles tentatives depuis la baseline.                                                                                                                                                 |
| `directory`         | `string \| undefined`                                                       | Optionnel | Répertoire du worktree du candidat sur l’hôte.                                                                                                                                                                                                                                             |
| `retainedDirectory` | `string \| undefined`                                                       | Optionnel | Worktree conservé après la fermeture de la sandbox : sale ou détaché, en échec, avec un nettoyage en attente, ou dans une course durable.                                                                                                                                                  |
| `result`            | `SpeculativeOutput<T> \| undefined`                                         | Optionnel | Sortie de dispatch, quand le dispatch du candidat s’est terminé.                                                                                                                                                                                                                           |
| `error`             | `unknown`                                                                   | Optionnel | Échec de l’allocation, du dispatch, de validate ou du nettoyage ; un message texte dans un enregistrement durable restauré.                                                                                                                                                                |

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
