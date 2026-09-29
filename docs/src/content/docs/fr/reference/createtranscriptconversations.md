---
title: "createTranscriptConversations"
description: "createTranscriptConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTranscriptConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un ConversationStore natif pour une CLI qui conserve un transcript JSONL par conversation, décrite par un TranscriptConversationLayout. locate cherche dans le home de l’hôte, capture retrouve le transcript dans la sandbox avec find et restore le téléverse ; les deux réécrivent les cwd enregistrés égaux au workspace d’origine. À utiliser pour un harness CLI externe ; les stores intégrés de Claude et Codex en sont construits.

[Exemple complet et règles détaillées](../../guide/conversation-formats/).

## Paramètres et propriétés

| Nom      | Type                           | Présence | Rôle                                                                                        |
| -------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------- |
| `layout` | `TranscriptConversationLayout` | Requis   | Emplacements des transcripts sur l’hôte et dans la sandbox, avec le nom de format persisté. |

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createTranscriptConversations(
  layout: TranscriptConversationLayout,
): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
- [TranscriptConversationLayout](../transcriptconversationlayout/)
