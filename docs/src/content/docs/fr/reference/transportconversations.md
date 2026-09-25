---
title: "transportConversations"
description: "transportConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { transportConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un ConversationStore Claude ou Codex avec snapshots de transport et espace de noms stable du projet. La capture préserve la relocalisation native et les transcripts enfants ; locate matérialise un snapshot immuable sous le dossier de récupération du dépôt cible. Les chemins file restent lisibles et reference identifie l’index distant. Fichiers natifs et identifiants restent distincts.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                           | Présence | Rôle                                                                                                                                        |
| --------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`              | `ConversationFormat`           | Requis   | Format natif du transcript, claude ou codex ; Gemini ne dispose pas de stockage de conversations natives.                                   |
| `options`             | `TransportConversationOptions` | Requis   | Transport et espace de noms stable du projet, partagé par les exécuteurs restaurant ces conversations.                                      |
| `options.namespace`   | `string`                       | Requis   | Espace de noms logique stable du projet, indépendant des chemins des checkouts. Utiliser des espaces distincts pour des projets différents. |
| `options.transporter` | `Transport`                    | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`ConversationStore`

## Signature

```ts
export declare function transportConversations(
  format: ConversationFormat,
  options: TransportConversationOptions,
): ConversationStore;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
