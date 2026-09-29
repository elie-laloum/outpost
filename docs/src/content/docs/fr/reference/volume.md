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

| Nom        | Type                   | Présence  | Rôle                                                                                                                                                               |
| ---------- | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `source`   | `string`               | Requis    | Chemin hôte à monter ; ~ désigne votre home et un chemin relatif part du dépôt. Un chemin absent fait échouer l’acquisition avec le code provider.                 |
| `target`   | `string`               | Requis    | Chemin dans le conteneur : absolu, relatif à la racine du workspace, ou sous le home de l’agent avec ~/. Un fichier isolé doit être monté dans le home de l’agent. |
| `readOnly` | `boolean \| undefined` | Optionnel | Monte le volume sans accès en écriture depuis la sandbox.                                                                                                          |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
