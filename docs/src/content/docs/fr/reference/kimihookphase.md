---
title: "KimiHookPhase"
description: "KimiHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { KimiHookPhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Événements natifs acceptés par defineKimiHook, indépendants des phases de la boucle Outpost. [Documentation native](https://moonshotai.github.io/kimi-code/en/customization/hooks), vérifiée le 13 octobre 2026.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Signature

```ts
export type KimiHookPhase = keyof KimiHookEvents;
```

## Contrats associés

- [KimiHookEvents](../kimihookevents/)
