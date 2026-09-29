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

| Nom           | Type                                                                             | Présence | Rôle                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `string`                                                                         | Requis   | Nom de format persisté dans les enregistrements de conversation, les clés de transport et les bundles de session. Le garder stable une fois des conversations capturées.                          |
| `directory`   | `(repository: string, home?: string) => string`                                  | Requis   | Dossier de l’hôte qui contient les conversations capturées de ce format pour un dépôt, sous home s’il est fourni.                                                                                 |
| `destination` | `(id: string, sandbox: SandboxLease, original: string) => string`                | Requis   | Chemin dans la sandbox écrit par la restauration de la conversation id, d’après son fichier capturé sur l’hôte.                                                                                   |
| `name`        | `string`                                                                         | Requis   | Nom du store, par exemple claude ou transport:&lt;namespace>:&lt;format>. Outpost l’associe à l’identifiant de conversation pour ne pas restaurer une conversation déjà présente dans la sandbox. |
| `locate`      | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Requis   | Retrouve une conversation capturée sur l’hôte à partir de son identifiant, du dépôt et d’un home optionnel, avant sa restauration. Échoue quand la conversation est absente.                      |
| `capture`     | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Requis   | Enregistre la conversation id depuis la sandbox du contexte vers l’hôte après un tour et renvoie son enregistrement.                                                                              |
| `restore`     | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Requis   | Écrit un enregistrement localisé dans la sandbox du contexte avant un tour de continuation, en relocalisant les chemins enregistrés vers le workspace de la sandbox.                              |

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
