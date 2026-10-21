---
title: "StorageReservationRecord"
description: "StorageReservationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationRecord } from "@elie-laloum/outpost/recovery";
```

## Paramètres et propriétés

| Nom     | Type                                                                                                                                                                                    | Présence  | Rôle                                                                                                                                                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bytes` | `number`                                                                                                                                                                                | Requis    | Octets encore réservés par cette entrée, y compris les anciennes entrées.                                                                                                                                                                                        |
| `owner` | `{ readonly id: string; readonly host: string; readonly pid: number; readonly createdAt: string; readonly repository: string; readonly identity?: LocalProcessIdentity; } \| undefined` | Optionnel | Identifiant d’instance du processus, nom d’hôte, PID, date de création de réservation et dépôt, avec l’identité du processus Linux si disponible. Absent pour les anciennes entrées ; ces champs identifient un propriétaire sans prouver son activité distante. |

## Signature

```ts
export interface StorageReservationRecord {
  readonly bytes: number;
  readonly owner?: {
    readonly id: string;
    readonly host: string;
    readonly pid: number;
    readonly createdAt: string;
    readonly repository: string;
    readonly identity?: LocalProcessIdentity;
  };
}
```

## Contrats associés

- [LocalProcessIdentity](../support-localprocessidentity/)
