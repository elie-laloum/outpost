---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 10
---

Contrat public de **speculate**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom                   | Type                                                                                                                         | Présence  | Rôle                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`             | `SpeculationOptions<T>`                                                                                                      | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.repository`  | `string`                                                                                                                     | Requis    | Checkout Git hôte ciblé.                                                                      |
| `options.provider`    | `import("../index.js").SandboxProvider`                                                                                      | Requis    | Backend de l’environnement d’exécution.                                                       |
| `options.candidates`  | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.concurrency` | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de tâches ou candidats concurrents admis.                                      |
| `options.budget`      | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées de tentatives et d’usage observé.                                           |
| `options.signal`      | `AbortSignal \| undefined`                                                                                                   | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.sandbox`     | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.validate`    | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
