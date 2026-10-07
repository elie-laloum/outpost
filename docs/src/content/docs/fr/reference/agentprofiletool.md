---
title: "AgentProfileTool"
description: "AgentProfileTool — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentProfileTool } from "@elie-laloum/outpost";
```

## Rôle et comportement

Capacité portable d’outil intégré : read, edit, shell sans restriction ou shell:&lt;commande exacte>. Les commandes exactes comparent la chaîne entière, espaces et syntaxe shell compris ; aucune expansion de joker ou préfixe n’a lieu.

[Exemple complet et règles détaillées](../../guide/choose-an-agent/).

## Signature

```ts
export type AgentProfileTool = "read" | "edit" | "shell" | `shell:${string}`;
```
