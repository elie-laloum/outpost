---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

Contrat public de **conversations**. Consultez le [guide conversations](../../guide/agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Signature

```ts
export declare const conversations: {
  native: typeof nativeConversations;
  locate: typeof locateConversation;
  capture: typeof captureConversation;
  restore: typeof restoreConversation;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
  claudePath(id: string, repository: string, home?: string): string;
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string;
  destination: typeof remotePath;
};
```

## Contrats associés

- [captureConversation](../support-captureconversation/)
- [ConversationFormat](../conversationformat/)
- [locateConversation](../support-locateconversation/)
- [nativeConversations](../support-nativeconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
- [remotePath](../support-remotepath/)
- [restoreConversation](../support-restoreconversation/)
