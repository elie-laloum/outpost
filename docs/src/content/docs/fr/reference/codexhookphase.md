---
title: "CodexHookPhase"
description: "CodexHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { CodexHookPhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Événements natifs acceptés par defineCodexHook, indépendants des phases de la boucle Outpost. [Documentation native](https://learn.chatgpt.com/docs/hooks), vérifiée le 13 octobre 2026.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Signature

```ts
export type CodexHookPhase = keyof CodexHookEvents;
```

## Contrats associés

- [CodexHookEvents](../codexhookevents/)
