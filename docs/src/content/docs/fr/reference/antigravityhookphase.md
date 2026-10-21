---
title: "AntigravityHookPhase"
description: "AntigravityHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AntigravityHookPhase } from "@elie-laloum/outpost/core";
```

## Rôle et comportement

Événements natifs acceptés par defineAntigravityHook, indépendants des phases de la boucle Outpost. [Documentation native](https://antigravity.google/docs/hooks), vérifiée le 13 octobre 2026.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Signature

```ts
export type AntigravityHookPhase = keyof AntigravityHookEvents;
```

## Contrats associés

- [AntigravityHookEvents](../antigravityhookevents/)
