---
title: "IntegrationOptions"
description: "IntegrationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { IntegrationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onConflict` | `ConflictResolver \| undefined` | Optionnel | Stratégie explicite appelée une fois pour un véritable conflit Git, avant de toucher au checkout hôte. Exige le mode integrate et un workspace sans sandbox ouverte. Un hôte sale, une branche hôte changée, un refus du guard ou un autre échec Git ne la déclenchent jamais. Sans elle, l’intégration conserve sa fusion directe habituelle. |
| `signal`     | `AbortSignal \| undefined`      | Optionnel | Annule l’intégration avant son démarrage et, avec onConflict, se propage à la préparation de la sandbox, à l’agent et à la vérification. Une résolution refusée ou annulée conserve les deux workspaces.                                                                                                                                       |
| `deadlineMs` | `number \| undefined`           | Optionnel | Délai total positif en millisecondes de l’intégration avec résolution explicite, 600000 par défaut. Inclut précontrôle, allocation, résolution et vérification ; les stratégies personnalisées doivent respecter le signal fourni. Sans effet sans onConflict.                                                                                 |

## Signature

```ts
export interface IntegrationOptions {
  readonly onConflict?: ConflictResolver;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```

## Contrats associés

- [ConflictResolver](../conflictresolver/)
