---
title: "FileWorkspaceInspection"
description: "FileWorkspaceInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceInspection } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence | Rôle                                                                                                                  |
| ----------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `record`    | `FileWorkspaceRecord` | Requis   | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération. |
| `reference` | `TransportReference`  | Requis   | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés.  |

## Signature

```ts
export interface FileWorkspaceInspection {
  readonly record: FileWorkspaceRecord;
  readonly reference: TransportReference;
}
```

## Contrats associés

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [TransportReference](../transportreference/)
