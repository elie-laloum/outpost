---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type                                  | Présence | Rôle                                                                                            |
| -------- | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `status` | `"unknown" \| "active" \| "inactive"` | Requis   | Indique si le processus enregistré est actif, inactif ou ne peut être identifié avec certitude. |
| `reason` | `string`                              | Requis   | Motif du classement du verrou local dans cet état de possession.                                |

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
