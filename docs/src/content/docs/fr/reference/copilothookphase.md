---
title: "CopilotHookPhase"
description: "CopilotHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { CopilotHookPhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Événements natifs acceptés par defineCopilotHook, indépendants des phases de la boucle Outpost. [Documentation native](https://docs.github.com/en/copilot/reference/hooks-reference), vérifiée le 13 octobre 2026.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Signature

```ts
export type CopilotHookPhase = keyof CopilotHookEvents;
```

## Contrats associés

- [CopilotHookEvents](../copilothookevents/)
