---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom        | Type                             | Présence | Rôle                                                                                                  |
| ---------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `complete` | `boolean`                        | Requis   | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible. |
| `scope`    | `"local-pid"`                    | Requis   | Toujours local-pid : les contrôles de possession utilisent l’identité de processus locale.            |
| `entries`  | `readonly LockInspectionEntry[]` | Requis   | Fichiers de verrou inspectés et évaluations de possession locale.                                     |
| `issues`   | `readonly StorageIssue[]`        | Requis   | Problèmes de fichiers, Git ou possession ayant empêché une inspection complète.                       |

## Signature

```ts
export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [LockInspectionEntry](../support-lockinspectionentry/)
- [StorageIssue](../support-storageissue/)
