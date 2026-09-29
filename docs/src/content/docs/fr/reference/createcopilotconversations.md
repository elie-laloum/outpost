---
title: "createCopilotConversations"
description: "createCopilotConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCopilotConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le ConversationStore natif de GitHub Copilot CLI. Chaque dossier de session sous $COPILOT_HOME ou ~/.copilot/session-state est capturé en un bundle JSON borné ; la restauration réécrit les chemins de workspace.yaml et de session.start. C’est le store par défaut de createCopilotHarness().

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createCopilotConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
