---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inventorie le stockage .outpost du dépôt cible, avec contrôles optionnels de Git, des verrous et de l’activité locale des sandboxes. L’inspection est en lecture seule, bornée par maxEntries, et n’énumère pas les comptes cloud.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                  | Type                                     | Présence  | Rôle                                                                                                 |
| -------------------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `options`            | `RecoveryInspectionOptions \| undefined` | Optionnel | Dépôt, limite de parcours et inspections optionnelles de Git, verrous et ressources.                 |
| `options.repository` | `string \| undefined`                    | Optionnel | Checkout Git hôte ciblé.                                                                             |
| `options.maxEntries` | `number \| undefined`                    | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.            |
| `options.git`        | `boolean \| undefined`                   | Optionnel | Inclut l’état Git des worktrees et les contrôles de modifications et verrouillage dans l’inventaire. |
| `options.locks`      | `boolean \| undefined`                   | Optionnel | Inclut l’inspection des fichiers de verrou locaux et de leur possession par les processus.           |
| `options.resources`  | `boolean \| undefined`                   | Optionnel | Inclut les baux de sandbox et opérations actives enregistrés localement.                             |

## Retour

`Promise<RecoveryInspection>`

## Signature

```ts
export declare function inspectRecovery(
  options?: RecoveryInspectionOptions,
): Promise<RecoveryInspection>;
```

## Contrats associés

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryInspectionOptions](../recoveryinspectionoptions/)
