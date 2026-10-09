---
title: "PublicationOperation"
description: "PublicationOperation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationOperation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                                 | Présence  | Rôle                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `path`              | `string`                                                                                             | Requis    | Chemin relatif validé conservant son préfixe ; traversées et chemins de contrôle sont refusés.           |
| `previous`          | `WorkspaceFileEntry \| undefined`                                                                    | Optionnel | Entrée attendue avant publication, conservée en quarantaine pour rollback conditionnel.                  |
| `incoming`          | `WorkspaceFileEntry \| undefined`                                                                    | Optionnel | Entrée entrante validée ; son absence représente une suppression explicitement sélectionnée.             |
| `rollbackDisplaced` | `string \| undefined`                                                                                | Optionnel | Chemin exclusif relatif à la sauvegarde conservant l’entrée installée déplacée pendant le rollback.      |
| `phase`             | `"pending" \| "quarantine-intent" \| "quarantined" \| "install-intent" \| "installed" \| "restored"` | Requis    | Phase durable d’intention/résultat permettant finish ou rollback sans réexécuter les tâches du workflow. |

## Signature

```ts
export interface PublicationOperation {
  readonly path: string;
  readonly previous?: WorkspaceFileEntry;
  readonly incoming?: WorkspaceFileEntry;
  rollbackDisplaced?: string;
  phase:
    | "pending"
    | "quarantine-intent"
    | "quarantined"
    | "install-intent"
    | "installed"
    | "restored";
}
```

## Contrats associés

- [WorkspaceFileEntry](../workspacefileentry/)
