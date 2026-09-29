---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                  | Présence  | Rôle                                                                                                                                                      |
| ----------- | ------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`      | `string`                              | Requis    | Chemin hôte du fichier objet de l’enregistrement en mode local ; sa clé de transport, resources/&lt;id>.json, en mode transport.                          |
| `record`    | `ResourceActivityRecord \| undefined` | Optionnel | Enregistrement analysé ; absent s’il était illisible, invalide ou modifié pendant l’inspection.                                                           |
| `ownership` | `LockOwnership`                       | Requis    | Verdict de possession : statut active, inactive ou unknown, avec un code de raison comme LOCAL_IDENTITY_MATCH, PROCESS_EXITED ou REMOTE_OWNER_UNVERIFIED. |

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
