---
title: "PermissionEffect"
description: "PermissionEffect — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { PermissionEffect } from "@elie-laloum/outpost";
```

## Rôle et comportement

Effet d’une HarnessPermissionRule, et du défaut des permissions quand aucune règle ne correspond. Valeurs : "allow" (l’appel d’outil s’exécute), "deny" (l’appel est refusé avec le motif de la règle). La première règle qui correspond décide ; une règle allow ne correspond que si tous les chemins correspondent, une règle deny dès qu’un chemin correspond.

[Exemple complet et règles détaillées](../../guide/harness-permissions/).

## Signature

```ts
export type PermissionEffect = "allow" | "deny";
```
