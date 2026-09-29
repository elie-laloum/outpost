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

Crée un NativeConversationStore pour une CLI qui écrit un transcript JSONL par conversation, décrite par layout. capture retrouve le fichier dans la sandbox avec find et le copie sur l’hôte, restore le téléverse, et tous deux réécrivent les cwd enregistrés pour la destination. Un transcript introuvable échoue avec le code session ; les stores Claude et Codex en sont construits.

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
