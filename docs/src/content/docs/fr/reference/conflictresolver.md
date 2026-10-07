---
title: "ConflictResolver"
description: "ConflictResolver — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ConflictResolver } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type              | Présence | Rôle                                                                                                                                                                 |
| --------- | ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context` | `ConflictContext` | Requis   | Workspace de résolution séparé, commits source et hôte exacts, chemins en conflit, signal d’annulation et hub d’observation hérité de cette tentative d’intégration. |

## Retour

`Promise<ConflictResolution>`

## Signature

```ts
export type ConflictResolver = (
  context: ConflictContext,
) => Promise<ConflictResolution>;
```

## Contrats associés

- [ConflictContext](../conflictcontext/)
- [ConflictResolution](../conflictresolution/)
