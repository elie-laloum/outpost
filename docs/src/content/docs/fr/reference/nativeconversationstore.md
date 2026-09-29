---
title: "NativeConversationStore"
description: "NativeConversationStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NativeConversationStore } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                             | Présence | Rôle                                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`      | `string`                                                                         | Requis   | Nom de format persisté dans les enregistrements de conversation, les clés de transport et les bundles de session. Le garder stable une fois des conversations capturées. |
| `directory`   | `(repository: string, home?: string) => string`                                  | Requis   | Dossier de l’hôte qui contient les conversations capturées de ce format pour un dépôt, sous home s’il est fourni.                                                        |
| `destination` | `(id: string, sandbox: SandboxLease, original: string) => string`                | Requis   | Chemin dans la sandbox écrit par la restauration de la conversation id, d’après son fichier capturé sur l’hôte.                                                          |
| `name`        | `string`                                                                         | Requis   | Identifiant de cette implémentation de stockage de conversations.                                                                                                        |
| `locate`      | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Requis   | Recherche un transcript existant par identifiant, dépôt et home hôte optionnel.                                                                                          |
| `capture`     | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Requis   | Capture la conversation de sandbox choisie dans le dossier de capture hôte du contexte.                                                                                  |
| `restore`     | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Requis   | Restaure un transcript dans la sandbox du contexte avant continuation.                                                                                                   |

## Signature

```ts
export interface NativeConversationStore extends ConversationStore {
  /** Persisted format name, used in transport keys, bundles and records. */
  readonly format: string;
  /** Host directory that holds this format's captured conversations. */
  directory(repository: string, home?: string): string;
  /** Sandbox path that restoration writes for a captured conversation. */
  destination(id: string, sandbox: SandboxLease, original: string): string;
}
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [SandboxLease](../sandboxlease/)
