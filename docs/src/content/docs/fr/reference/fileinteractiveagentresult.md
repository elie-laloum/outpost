---
title: "FileInteractiveAgentResult"
description: "FileInteractiveAgentResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileInteractiveAgentResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                  | Présence | Rôle                                                                                                                  |
| --------------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `output`        | `WorkflowJson`        | Requis   | Réponse finale validée du dialogue interactif terminé.                                                                |
| `conversation`  | `string`              | Requis   | Identifiant de conversation native capturée utilisé pour la continuation.                                             |
| `directory`     | `string`              | Requis   | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                  |
| `turns`         | `number`              | Requis   | Tours de dialogue terminés conservés sans replay lors d’une soumission ordinaire de réponse.                          |
| `workspaceInfo` | `FileWorkspaceRecord` | Requis   | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération. |

## Signature

```ts
export interface FileInteractiveAgentResult {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly directory: string;
  readonly turns: number;
  readonly workspaceInfo: FileWorkspaceRecord;
}
```

## Contrats associés

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [WorkflowJson](../workflowjson/)
