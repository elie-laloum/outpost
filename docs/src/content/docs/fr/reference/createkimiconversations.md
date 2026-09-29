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

Crée le ConversationStore natif de Kimi Code. Les dossiers de session sous $KIMI_CODE_HOME ou ~/.kimi-code/sessions/<bucket du workspace> sont capturés en bundles JSON bornés, sans logs, tâches, cron, notifications ni verrous ; la restauration choisit le bucket de destination et réécrit state.json. C’est le store par défaut de createKimiHarness().

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createKimiConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
