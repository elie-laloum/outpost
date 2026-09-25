---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                   | Présence  | Rôle                                                      |
| ---------- | ---------------------- | --------- | --------------------------------------------------------- |
| `source`   | `string`               | Requis    | Chemin hôte à monter dans la sandbox.                     |
| `target`   | `string`               | Requis    | Chemin absolu de destination du montage dans la sandbox.  |
| `readOnly` | `boolean \| undefined` | Optionnel | Monte le volume sans accès en écriture depuis la sandbox. |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
