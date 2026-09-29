---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
La spéculation est expérimentale : ses options et son résultat peuvent encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Rôle et comportement

Met en concurrence 1 à 8 candidats depuis le HEAD du checkout, chacun sur sa branche et dans sa sandbox, et sélectionne le premier que validate accepte une fois sa sandbox fermée. Renvoie le résultat de chaque candidat, l’usage partagé et une vérification de fusion du gagnant ; ne fusionne jamais. Des options invalides rejettent avec le code configuration.

[Exemple complet et règles détaillées](../../guide/speculation/).

## Paramètres et propriétés

| Nom                       | Type                                                                                                                         | Présence  | Rôle                                                                                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Requis    | Dépôt, provider de sandbox, candidats, budget partagé et callback validate, plus les réglages de concurrence, de nettoyage et de durabilité.                                                                                                                           |
| `options.durability`      | `SpeculationDurability \| undefined`                                                                                         | Optionnel | Enregistre la course via un Transport pour la reprendre après un plantage ou un arrêt de quota. Exige un provider doté de recover ; omettez-le pour une course en mémoire.                                                                                             |
| `options.cleanupMs`       | `number \| undefined`                                                                                                        | Optionnel | Attente de chaque fermeture de sandbox ou récupération de ressource, et des candidats en cours après une annulation, 30000 par défaut. Au-delà, le nettoyage reste en attente.                                                                                         |
| `options.observation`     | `ObservationHub \| undefined`                                                                                                | Optionnel | Hub parent des événements de tous les candidats, délimités par clé de candidat ; il remplace l’observation propre à chaque request.                                                                                                                                    |
| `options.repository`      | `string`                                                                                                                     | Requis    | Checkout Git hôte. Son commit HEAD au premier démarrage de la course sert de baseline à toutes les branches candidates.                                                                                                                                                |
| `options.sandboxProvider` | `SandboxProvider`                                                                                                            | Requis    | Provider qui alloue la sandbox de chaque candidat. Le mode durable en exige un doté de recover : Docker ou Podman en mode monté.                                                                                                                                       |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | 1 à 8 candidats aux clés uniques, démarrés dans l’ordre de la liste selon concurrency.                                                                                                                                                                                 |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de candidats exécutés à la fois, de 1 à 8, 2 par défaut.                                                                                                                                                                                                |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées par tous les candidats. Chaque démarrage consomme une unité de attempts et la limite empêche tout nouveau démarrage ; atteindre une limite de tokens de usage annule les candidats en cours. Les tokens consommés dans validate ne sont pas comptés. |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optionnel | Son annulation arrête les candidats en cours et termine la course avec le statut aborted.                                                                                                                                                                              |
| `options.sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Réglages de sandbox appliqués à chaque candidat : hooks, bootstrap, logging, limits, storageQuota et conversationHome.                                                                                                                                                 |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Décide si un candidat terminé est acceptable, à partir de sa sortie de dispatch et de sa sandbox active ; true l’accepte. Une exception marque le candidat failed.                                                                                                     |

## Retour

`Promise<SpeculationResult<T>>`

## Signature

```ts
export declare function speculate<T = undefined>(
  options: SpeculationOptions<T>,
): Promise<SpeculationResult<T>>;
```

## Contrats associés

- [SpeculationOptions](../speculationoptions/)
- [SpeculationResult](../speculationresult/)
