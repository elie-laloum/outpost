---
title: "ClaudeHookPhase"
description: "ClaudeHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ClaudeHookPhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Événements natifs acceptés par defineClaudeHook, indépendants des phases de la boucle Outpost. [Documentation native](https://code.claude.com/docs/en/hooks), vérifiée le 13 octobre 2026.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Signature

```ts
export type ClaudeHookPhase = keyof ClaudeHookEvents;
```

## Contrats associés

- [ClaudeHookEvents](../claudehookevents/)
