---
title: "FallbackRecord"
description: "FallbackRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                         | Présence | Rôle                                                                                                                                           |
| ---------- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `selected` | `FallbackCandidate`          | Requis   | Candidat qui a produit le résultat du dispatch ; resume() et fork() continuent avec lui.                                                       |
| `attempts` | `readonly FallbackAttempt[]` | Requis   | Candidats arrêtés avant celui qui a été retenu, dans l’ordre, avec l’échec qui a mis fin à chacun ; vide lorsque le premier candidat a réussi. |

## Signature

```ts
export interface FallbackRecord {
  /** Candidate that produced the dispatch result. */
  readonly selected: FallbackCandidate;
  /** Candidates that failed before it, in order. */
  readonly attempts: readonly FallbackAttempt[];
}
```

## Contrats associés

- [FallbackAttempt](../fallbackattempt/)
- [FallbackCandidate](../fallbackcandidate/)
