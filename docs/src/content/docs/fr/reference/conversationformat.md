---
title: "ConversationFormat"
description: "ConversationFormat — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ConversationFormat } from "@elie-laloum/outpost";
```

## Rôle et comportement

Nom persisté d’un format de conversation natif, enregistré dans chaque ConversationLocation ainsi que dans les clés de transport, les bundles et les enregistrements. Les noms intégrés sont "claude", "codex", "copilot", "kimi" et "harness" (harness Outpost intégré) ; un nom stocké ne doit pas changer.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Signature

```ts
export type ConversationFormat = string;
```
