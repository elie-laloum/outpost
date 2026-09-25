---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom        | Type                             | Présence | Rôle                                                                             |
| ---------- | -------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `complete` | `boolean`                        | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `scope`    | `"local-pid"`                    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `entries`  | `readonly LockInspectionEntry[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `issues`   | `readonly StorageIssue[]`        | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
