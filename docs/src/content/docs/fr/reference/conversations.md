---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Objet figé qui regroupe des utilitaires de conversation : transported est createTransportConversations(), harness est createHarnessConversations(), rewrite est relocateTranscript() et projectKey calcule le nom du dossier de projet de Claude.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Paramètres et propriétés

| Nom           | Type                                                                                    | Présence | Rôle                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `transported` | `(base: ConversationStore, options: TransportConversationOptions) => ConversationStore` | Requis   | createTransportConversations() : enveloppe un store de base pour archiver aussi chaque capture via un transport.                                             |
| `harness`     | `() => ConversationStore`                                                               | Requis   | Crée le store de conversations par défaut des harness personnalisés, dont les transcriptions se trouvent dans .outpost/conversations/harness du dépôt cible. |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                        | Requis   | relocateTranscript() : remplace dans le texte d’un transcript les cwd enregistrés égaux à source par destination, sans entrée/sortie fichier.                |
| `projectKey`  | `(path: string) => string`                                                              | Requis   | Encode un chemin de dépôt en clé de dossier de projet natif Claude.                                                                                          |

## Signature

```ts
export declare const conversations: Readonly<{
  transported: typeof createTransportConversations;
  harness: typeof createHarnessConversations;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
}>;
```

## Contrats associés

- [createHarnessConversations](../createharnessconversations/)
- [createTransportConversations](../createtransportconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
