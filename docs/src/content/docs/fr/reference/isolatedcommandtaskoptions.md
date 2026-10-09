---
title: "IsolatedCommandTaskOptions"
description: "IsolatedCommandTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { IsolatedCommandTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                                                          | Présence | Rôle                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `request` | `(context: TaskContext) => FileIsolatedCommandRequest \| Promise<FileIsolatedCommandRequest>` | Requis   | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition. |

## Signature

```ts
export interface IsolatedCommandTaskOptions {
  readonly request: (
    context: TaskContext,
  ) => FileIsolatedCommandRequest | Promise<FileIsolatedCommandRequest>;
}
```

## Contrats associés

- [FileIsolatedCommandRequest](../fileisolatedcommandrequest/)
- [TaskContext](../taskcontext/)
