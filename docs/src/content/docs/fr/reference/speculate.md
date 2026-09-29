---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécute des candidats bornés depuis un commit initial figé, les valide dans leurs sandboxes actives et sélectionne un gagnant après son nettoyage. Le mode durable persiste propriété, tentatives, usage et résultats via Transport et exige récupération/rejeu explicites après un crash. Renvoie les emplacements préservés et une vérification de fusion Git sans intégrer la branche.

[Exemple complet et règles détaillées](../../guide/speculation/).

## Paramètres et propriétés

| Nom                       | Type                                                                                                                         | Présence  | Rôle                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Requis    | Dépôt, provider, candidats bornés, budget d’admission et callback de validation du gagnant.                                                                            |
| `options.durability`      | `SpeculationDurability \| undefined`                                                                                         | Optionnel | Persiste cette course via Transport ; exige la récupération du provider. Omettre pour une course en mémoire.                                                           |
| `options.cleanupMs`       | `number \| undefined`                                                                                                        | Optionnel | Attente maximale en millisecondes par fermeture/récupération et pour les workers après annulation ; 30000 par défaut. Les ressources non terminées restent en attente. |
| `options.observation`     | `import("../domain/observation.types.ts").ObservationHub \| undefined`                                                       | Optionnel | Hub parent qui corrèle allocation, événements d’agent, validation, sélection et nettoyage par clé de candidat.                                                         |
| `options.repository`      | `string`                                                                                                                     | Requis    | Checkout Git hôte ciblé.                                                                                                                                               |
| `options.sandboxProvider` | `import("../index.js").SandboxProvider`                                                                                      | Requis    | Backend de l’environnement d’exécution.                                                                                                                                |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | Requêtes d’agent mises en concurrence sur des branches distinctes ; huit candidats au maximum.                                                                         |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de candidats exécutés simultanément ; deux par défaut.                                                                                                  |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées de tentatives et d’usage observé.                                                                                                                    |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optionnel | Annulation coopérative de cette opération.                                                                                                                             |
| `options.sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Réglages communs de cycle de vie, journaux et stockage appliqués à l’allocation de chaque sandbox candidate.                                                           |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Prédicat exécuté avec la sandbox active et la sortie d’un candidat ; true l’accepte comme gagnant possible.                                                            |

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
