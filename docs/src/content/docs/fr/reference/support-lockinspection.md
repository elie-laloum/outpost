---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom        | Type                             | Présence | Rôle                                                                                       |
| ---------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `complete` | `boolean`                        | Requis   | true lorsqu’aucun état de verrou n’est unknown.                                            |
| `scope`    | `"local-pid"`                    | Requis   | Toujours local-pid : les contrôles de possession utilisent l’identité de processus locale. |
| `entries`  | `readonly LockInspectionEntry[]` | Requis   | État de chaque entrée de .outpost/locks.                                                   |
| `issues`   | `readonly StorageIssue[]`        | Requis   | Un problème par verrou dont l’état est unknown, avec son motif comme code.                 |

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
