---
title: "HarnessRun"
description: "HarnessRun — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessRun } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type             | Présence | Rôle                                                                                                 |
| --------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `input`   | `HarnessInput`   | Requis   | Prompt préparé transmis à une passe d’exécution personnalisée.                                       |
| `context` | `HarnessContext` | Requis   | Accès au modèle, sandbox, signal d’annulation et callback d’observation isolé propres à l’opération. |

## Retour

`Promise<ModelResult>`

## Signature

```ts
export type HarnessRun = (
  input: HarnessInput,
  context: HarnessContext,
) => Promise<ModelResult>;
```

## Contrats associés

- [HarnessContext](../harnesscontext/)
- [HarnessInput](../harnessinput/)
- [ModelResult](../modelresult/)
