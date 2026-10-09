---
title: "FileAttachResult"
description: "FileAttachResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileAttachResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                  | Présence | Rôle                                                                                                                                                                                                     |
| --------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceInfo` | `FileWorkspaceRecord` | Requis   | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                                                                                    |
| `directory`     | `string`              | Requis   | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                                                                                                     |
| `status`        | `number`              | Requis   | Code de sortie du processus, 0 en cas de succès. Un code non nul résout quand même la commande : vérifiez-le.                                                                                            |
| `stdout`        | `string`              | Requis   | Derniers caractères de la sortie standard, dans la limite de retain. Vide quand une commande interactive sans flux de terminal utilisait le terminal de l’hôte avec le provider local, Docker ou Podman. |
| `stderr`        | `string`              | Requis   | Derniers caractères de la sortie d’erreur, dans la limite de retain. Vide dans le même cas de terminal hôte, et pour un terminal Daytona, dont toute la sortie est dans stdout.                          |

## Signature

```ts
export interface FileAttachResult extends CommandResult {
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
}
```

## Contrats associés

- [CommandResult](../commandresult/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
