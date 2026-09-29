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

Crée le store natif de GitHub Copilot CLI, celui par défaut de createCopilotHarness(). Chaque dossier de session sous &lt;home de la CLI>/session-state, où le home de la CLI est $COPILOT_HOME ou ~/.copilot, est capturé en un bundle JSON à .outpost/conversations/copilot/&lt;id>.json. La restauration réécrit cwd et la racine Git dans workspace.yaml et dans l’événement session.start.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createCopilotConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
