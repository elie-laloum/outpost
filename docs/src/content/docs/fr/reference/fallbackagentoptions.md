---
title: "FallbackAgentOptions"
description: "FallbackAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAgentOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom  | Type                         | Présence | Rôle                                                                                                                                                                                               |
| ---- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on` | `readonly FallbackTrigger[]` | Requis   | Catégories d’échec qui font passer au candidat suivant : quota, unavailable ou les deux, sans valeur par défaut. Une liste vide, une répétition ou une valeur inconnue lève le code configuration. |

## Signature

```ts
export interface FallbackAgentOptions {
  /** Failure categories that hand the dispatch to the next candidate. */
  readonly on: readonly FallbackTrigger[];
}
```

## Contrats associés

- [FallbackTrigger](../fallbacktrigger/)
