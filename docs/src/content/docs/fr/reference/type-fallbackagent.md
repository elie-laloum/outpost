---
title: "FallbackAgent"
description: "FallbackAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAgent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                         | Présence | Rôle                                                                                                                     |
| -------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `kind`   | `"fallback"`                 | Requis   | Discriminant identifiant une liste de secours ordonnée plutôt qu’un agent unique.                                        |
| `agents` | `readonly Agent[]`           | Requis   | Copie figée des candidats, dans l’ordre où ils sont essayés ; au moins deux, aucun n’étant lui-même un agent de secours. |
| `on`     | `readonly FallbackTrigger[]` | Requis   | Copie figée des catégories d’échec qui font passer au candidat suivant ; tout autre échec est relancé.                   |

## Signature

```ts
export interface FallbackAgent {
  readonly kind: "fallback";
  /** Candidates in the order they are tried. */
  readonly agents: readonly Agent[];
  readonly on: readonly FallbackTrigger[];
}
```

## Contrats associés

- [Agent](../type-agent/)
- [FallbackTrigger](../fallbacktrigger/)
