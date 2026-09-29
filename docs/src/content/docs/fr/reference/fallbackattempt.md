---
title: "FallbackAttempt"
description: "FallbackAttempt — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAttempt } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                                                           |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `failure` | `FallbackTrigger`     | Requis    | Catégorie qui a arrêté ce candidat : quota ou unavailable.                                                                     |
| `message` | `string`              | Requis    | Message de quota ou de panne qui a arrêté ce candidat.                                                                         |
| `resetAt` | `string \| undefined` | Optionnel | Horodatage ISO de réinitialisation signalé avec un échec de quota ; absent pour les pannes et les réinitialisations inconnues. |
| `index`   | `number`              | Requis    | Position du candidat dans FallbackAgent.agents, à partir de zéro.                                                              |
| `name`    | `string`              | Requis    | Nom de l’adapter du candidat, par exemple claude, codex, custom ou replay.                                                     |
| `model`   | `string \| undefined` | Optionnel | Nom du modèle choisi sur le candidat ; absent quand une CLI garde son défaut natif, et pour un agent de rejeu.                 |

## Signature

```ts
export interface FallbackAttempt extends FallbackCandidate {
  readonly failure: FallbackTrigger;
  readonly message: string;
  readonly resetAt?: string;
}
```

## Contrats associés

- [FallbackCandidate](../fallbackcandidate/)
- [FallbackTrigger](../fallbacktrigger/)
