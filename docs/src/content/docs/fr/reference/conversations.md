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

Regroupe les opérations sur les transcripts natifs : localisation sur l’hôte, capture depuis une sandbox, restauration avant continuation et réécriture des chemins du dépôt. native construit un ConversationStore pour Claude ou Codex ; ces outils de stockage ne gèrent pas l’authentification.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom           | Type                                                                                                                                                                                                                                                                | Présence | Rôle                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `native`      | `(format: ConversationFormat) => import("../index.js").ConversationStore`                                                                                                                                                                                           | Requis   | Crée un ConversationStore natif Claude ou Codex pour persister les transcripts.                           |
| `locate`      | `(format: ConversationFormat, id: string, repository: string, home?: string) => Promise<import("./conversations.types.ts").ConversationLocation>`                                                                                                                   | Requis   | Localise un transcript natif sur l’hôte par format, identifiant, dépôt et home optionnel.                 |
| `capture`     | `(format: ConversationFormat, id: string, repository: string, lease: import("../index.js").SandboxLease, staging: string, options?: import("./conversations/capture.types.js").CaptureOptions) => Promise<import("./conversations.types.ts").ConversationLocation>` | Requis   | Capture la conversation choisie depuis un bail de sandbox vers le dossier de capture hôte.                |
| `restore`     | `(location: import("./conversations.types.ts").ConversationLocation, lease: import("../index.js").SandboxLease, staging: string) => Promise<void>`                                                                                                                  | Requis   | Restaure un transcript localisé dans une sandbox et adapte ses chemins de dépôt.                          |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                                                                                                                                                                                                    | Requis   | Réécrit les chemins de dépôt d’un transcript natif de source vers destination sans entrée/sortie fichier. |
| `projectKey`  | `(path: string) => string`                                                                                                                                                                                                                                          | Requis   | Encode un chemin de dépôt en clé de dossier de projet natif Claude.                                       |
| `claudePath`  | `(id: string, repository: string, home?: string) => string`                                                                                                                                                                                                         | Requis   | Calcule le chemin du transcript Claude hôte pour un identifiant et un dépôt.                              |
| `directory`   | `(format: ConversationFormat, repository: string, home?: string) => string`                                                                                                                                                                                         | Requis   | Calcule le dossier hôte des transcripts pour le format et le dépôt choisis.                               |
| `destination` | `(format: ConversationFormat, id: string, lease: import("../index.js").SandboxLease, original: string) => string`                                                                                                                                                   | Requis   | Calcule le chemin de destination du transcript dans le home de l’agent en sandbox.                        |

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
