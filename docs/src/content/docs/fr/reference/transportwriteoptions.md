---
title: "TransportWriteOptions"
description: "TransportWriteOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportWriteOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                       | Présence  | Rôle                                                                                                                                                         |
| ------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signal`     | `AbortSignal \| undefined` | Optionnel | Annule une mutation. Une interruption réseau peut rendre son résultat incertain ; relire avant de décider de réessayer.                                      |
| `ifRevision` | `string \| null`           | Requis    | Révision que l’objet doit avoir actuellement, ou null pour exiger que la clé soit absente. Une différence provoque TransportConflict ; remove() refuse null. |

## Signature

```ts
export interface TransportWriteOptions {
  readonly signal?: AbortSignal;
  readonly ifRevision: string | null;
}
```
