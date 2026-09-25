---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                     | Présence  | Rôle                                                                                                                                        |
| ------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined` | Optionnel | Inventorie les clés d’objets et éventuellement les activités dans ce transport ; l’inspection de Git et des verrous hôtes est incompatible. |
| `repository`  | `string \| undefined`    | Optionnel | Checkout Git hôte ciblé.                                                                                                                    |
| `maxEntries`  | `number \| undefined`    | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                   |
| `git`         | `boolean \| undefined`   | Optionnel | Inclut l’état Git des worktrees et les contrôles de modifications et verrouillage dans l’inventaire.                                        |
| `locks`       | `boolean \| undefined`   | Optionnel | Inclut l’inspection des fichiers de verrou locaux et de leur possession par les processus.                                                  |
| `resources`   | `boolean \| undefined`   | Optionnel | Inclut les baux de sandbox et opérations actives enregistrés localement.                                                                    |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```

## Contrats associés

- [Transport](../transport/)
