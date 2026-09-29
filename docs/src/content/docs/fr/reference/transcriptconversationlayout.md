---
title: "TranscriptConversationLayout"
description: "TranscriptConversationLayout — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TranscriptConversationLayout } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                                                         | Présence  | Rôle                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`           | `string`                                                                     | Requis    | Nom de format persisté dans les enregistrements de conversation et les clés de transport.                                                                                                              |
| `sidecars`         | `boolean`                                                                    | Requis    | Indique si les transcripts enfants sous &lt;dossier du transcript>/&lt;id>/subagents sont capturés et restaurés avec le transcript principal ; l’échec d’un enfant produit seulement un avertissement. |
| `searchRoot`       | `(home: string) => string`                                                   | Requis    | Dossier de l’hôte parcouru récursivement pour localiser le transcript d’une conversation.                                                                                                              |
| `remoteSearchRoot` | `(home: string) => string`                                                   | Requis    | Dossier de la sandbox parcouru avec find lors de la capture d’une conversation.                                                                                                                        |
| `pattern`          | `(id: string) => string`                                                     | Requis    | Motif find -name qui correspond au fichier transcript d’une conversation dans la sandbox.                                                                                                              |
| `matches`          | `(file: string, id: string) => boolean`                                      | Requis    | Indique si un fichier de l’hôte trouvé sous searchRoot est le transcript de la conversation.                                                                                                           |
| `directory`        | `(repository: string, home: string) => string`                               | Requis    | Dossier de l’hôte qui contient les transcripts capturés d’un dépôt.                                                                                                                                    |
| `preferredPath`    | `((id: string, repository: string, home: string) => string) \| undefined`    | Optionnel | Chemin de l’hôte vérifié en premier pour localiser une conversation, avant de parcourir searchRoot.                                                                                                    |
| `capturePath`      | `(id: string, repository: string, home: string, original: string) => string` | Requis    | Chemin de l’hôte où la capture écrit le transcript trouvé à original dans la sandbox.                                                                                                                  |
| `remotePath`       | `(id: string, lease: SandboxLease, original: string) => string`              | Requis    | Chemin de la sandbox où la restauration écrit un transcript capturé pour le workspace du bail.                                                                                                         |

## Signature

```ts
export interface TranscriptConversationLayout {
  /** Persisted format name, used in transport keys and conversation records. */
  readonly format: string;
  /** Whether child transcripts live under `<directory>/<id>/subagents/`. */
  readonly sidecars: boolean;
  searchRoot(home: string): string;
  remoteSearchRoot(home: string): string;
  /** `find -name` pattern matching the transcript file in the sandbox. */
  pattern(id: string): string;
  matches(file: string, id: string): boolean;
  directory(repository: string, home: string): string;
  preferredPath?(id: string, repository: string, home: string): string;
  capturePath(
    id: string,
    repository: string,
    home: string,
    original: string,
  ): string;
  remotePath(id: string, lease: SandboxLease, original: string): string;
}
```

## Contrats associés

- [SandboxLease](../sandboxlease/)
