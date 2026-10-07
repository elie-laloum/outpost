---
title: "SpeculationOptions"
description: "SpeculationOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                                                                                                         | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `durability`      | `SpeculationDurability \| undefined`                                                                                         | Optionnel | Enregistre la course via un Transport pour la reprendre après un plantage ou un arrêt de quota. Exige un provider doté de recover ; omettez-le pour une course en mémoire.                                                                                                                                                                                                                                                                                                          |
| `cleanupMs`       | `number \| undefined`                                                                                                        | Optionnel | Attente de chaque fermeture de sandbox ou récupération de ressource, et des candidats en cours après une annulation, 30000 par défaut. Au-delà, le nettoyage reste en attente.                                                                                                                                                                                                                                                                                                      |
| `observation`     | `ObservationHub \| undefined`                                                                                                | Optionnel | Hub parent des événements de tous les candidats, délimités par clé de candidat ; il remplace l’observation propre à chaque request.                                                                                                                                                                                                                                                                                                                                                 |
| `repository`      | `string`                                                                                                                     | Requis    | Checkout Git hôte. Son commit HEAD au premier démarrage de la course sert de baseline à toutes les branches candidates.                                                                                                                                                                                                                                                                                                                                                             |
| `sandboxProvider` | `SandboxProvider`                                                                                                            | Requis    | Provider qui alloue la sandbox de chaque candidat. Le mode durable en exige un doté de recover : Docker ou Podman en mode monté.                                                                                                                                                                                                                                                                                                                                                    |
| `candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | 1 à 8 candidats aux clés uniques, démarrés dans l’ordre de la liste selon concurrency.                                                                                                                                                                                                                                                                                                                                                                                              |
| `concurrency`     | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de candidats exécutés à la fois, de 1 à 8, 2 par défaut.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `select`          | `"first" \| "best" \| undefined`                                                                                             | Optionnel | first (par défaut) choisit le premier candidat validé dont la sandbox se ferme et annule les autres. best laisse finir tous les candidats admis, puis choisit le score fini le plus élevé parmi les candidats acceptés et nettoyés sans erreur ; les égalités suivent l’ordre de déclaration. Une annulation ou un budget de tokens épuisé empêche la sélection best.                                                                                                               |
| `score`           | `((candidate: SpeculativeValidation<T>) => number \| Promise<number>) \| undefined`                                          | Optionnel | Obligatoire uniquement avec select: best. S’exécute après l’acceptation par validate, avant la fermeture de la sandbox, avec les mêmes key, result, sandbox et signal. Renvoyez un nombre fini ; le plus élevé gagne, même négatif. Une exception ou un score invalide fait échouer ce candidat. Les scores enregistrés sont réutilisés à la récupération durable ; changez durability.version quand ce callback change. L’usage des agents imbriqués reste hors du budget partagé. |
| `budget`          | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées par tous les candidats. Chaque démarrage consomme une unité de attempts et la limite empêche tout nouveau démarrage ; atteindre une limite de tokens de usage annule les candidats en cours. Les tokens consommés dans validate ou score ne sont pas comptés.                                                                                                                                                                                                     |
| `signal`          | `AbortSignal \| undefined`                                                                                                   | Optionnel | Son annulation arrête les candidats en cours et termine la course avec le statut aborted.                                                                                                                                                                                                                                                                                                                                                                                           |
| `sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Réglages de sandbox appliqués à chaque candidat : hooks, bootstrap, logging, limits, storageQuota et conversationHome.                                                                                                                                                                                                                                                                                                                                                              |
| `validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Décide si un candidat terminé est acceptable, à partir de sa sortie de dispatch et de sa sandbox active ; true l’accepte. Une exception marque le candidat failed.                                                                                                                                                                                                                                                                                                                  |

## Signature

```ts
export interface SpeculationOptions<T = undefined> {
  readonly durability?: SpeculationDurability;
  readonly cleanupMs?: number;
  readonly observation?: ObservationHub;
  readonly repository: string;
  readonly sandboxProvider: NonNullable<SandboxOptions["sandboxProvider"]>;
  readonly candidates: readonly SpeculativeCandidate<T>[];
  readonly concurrency?: number;
  readonly select?: "first" | "best";
  readonly score?: (
    candidate: SpeculativeValidation<T>,
  ) => number | Promise<number>;
  readonly budget: WorkflowBudget;
  readonly signal?: AbortSignal;
  readonly sandbox?: Pick<
    SandboxOptions,
    | "hooks"
    | "bootstrap"
    | "logging"
    | "limits"
    | "storageQuota"
    | "conversationHome"
  >;
  readonly validate: (
    candidate: SpeculativeValidation<T>,
  ) => boolean | Promise<boolean>;
}
```

## Contrats associés

- [SandboxOptions](../sandboxoptions/)
- [SpeculationDurability](../speculationdurability/)
- [SpeculativeCandidate](../speculativecandidate/)
- [SpeculativeValidation](../speculativevalidation/)
- [WorkflowBudget](../workflowbudget/)
