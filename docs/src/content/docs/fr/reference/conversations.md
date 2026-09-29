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

Regroupe les utilitaires de conversations : transported construit un store adossé à un transport, harness le store des harness personnalisés, rewrite relocalise les cwd enregistrés et projectKey calcule le nom de dossier de projet Claude. Le store natif de chaque agent vient de sa propre fonction : createClaudeConversations(), createCodexConversations(), createCopilotConversations() ou createKimiConversations(). Ces utilitaires ne gèrent pas l’authentification des agents.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom           | Type                                                                                    | Présence | Rôle                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(base: ConversationStore, options: TransportConversationOptions) => ConversationStore` | Requis   | Construit un store natif sur un transport de l’appelant avec un espace de noms stable du projet, incluant les transcripts enfants et la matérialisation locale. |
| `harness`     | `() => ConversationStore`                                                               | Requis   | Crée le store de conversations par défaut des harness personnalisés, dont les transcriptions se trouvent dans .outpost/conversations/harness du dépôt cible.    |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                        | Requis   | Réécrit les chemins de dépôt d’un transcript natif de source vers destination sans entrée/sortie fichier.                                                       |
| `projectKey`  | `(path: string) => string`                                                              | Requis   | Encode un chemin de dépôt en clé de dossier de projet natif Claude.                                                                                             |

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
