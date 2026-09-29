---
title: "createKimiConversations"
description: "createKimiConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createKimiConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le store natif de Kimi Code, celui par défaut de createKimiHarness(). Chaque dossier de session sous &lt;home de la CLI>/sessions/&lt;bucket du workspace>, où le home de la CLI est $KIMI_CODE_HOME ou ~/.kimi-code, est capturé en un bundle JSON sans ses fichiers logs, tasks, cron, notify ni verrous ; seul state.json en version 2 est accepté. La restauration place la session dans le bucket du workspace de destination et réécrit state.json.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createKimiConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
