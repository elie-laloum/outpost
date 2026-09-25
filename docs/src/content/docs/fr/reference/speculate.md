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

Exécute des candidats agents bornés sur des branches distinctes issues d’une même base et retient le premier accepté par validate après nettoyage. Annule les perdants et rapporte changements hôtes et usage cumulé. Ce prototype opt-in n’intègre ni ne pousse automatiquement le gagnant.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom                       | Type                                                                                                                         | Présence  | Rôle                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Requis    | Dépôt, provider, candidats bornés, budget d’admission et callback de validation du gagnant.                  |
| `options.repository`      | `string`                                                                                                                     | Requis    | Checkout Git hôte ciblé.                                                                                     |
| `options.sandboxProvider` | `import("../index.js").SandboxProvider`                                                                                      | Requis    | Backend de l’environnement d’exécution.                                                                      |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | Requêtes d’agent mises en concurrence sur des branches distinctes ; huit candidats au maximum.               |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de candidats exécutés simultanément ; deux par défaut.                                        |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées de tentatives et d’usage observé.                                                          |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optionnel | Annulation coopérative de cette opération.                                                                   |
| `options.sandbox`         | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Réglages communs de cycle de vie, journaux et stockage appliqués à l’allocation de chaque sandbox candidate. |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Prédicat exécuté avec la sandbox active et la sortie d’un candidat ; true l’accepte comme gagnant possible.  |

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
