---
title: "FileWorkspaceInspectionOptions"
description: "FileWorkspaceInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceInspectionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                     | Présence  | Rôle                                                                                                             |
| ------------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `runtime`     | `WorkspaceRuntime`       | Requis    | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                  |
| `id`          | `string`                 | Requis    | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                 |
| `transporter` | `Transport \| undefined` | Optionnel | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials. |

## Signature

```ts
export interface FileWorkspaceInspectionOptions {
  readonly runtime: WorkspaceRuntime;
  readonly id: string;
  readonly transporter?: Transport;
}
```

## Contrats associés

- [Transport](../transport/)
- [WorkspaceRuntime](../workspaceruntime/)
