---
title: "Channel"
description: "Channel — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Channel } from "@elie-laloum/outpost";
```

## Rôle et comportement

Flux de sortie d’où provient une ligne de commande, transmis à Command.observe(). Valeurs : "stdout" (sortie standard), "stderr" (sortie d’erreur).

[Exemple complet et règles détaillées](../../guide/sandbox-sessions/).

## Signature

```ts
export type Channel = "stdout" | "stderr";
```
