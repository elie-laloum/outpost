---
title: "CaptureOptions"
description: "CaptureOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom     | Type                                       | Présence  | Rôle                                                                                             |
| ------- | ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------ |
| `home`  | `string \| undefined`                      | Optionnel | Home d’agent hôte utilisé pour localiser ou persister les transcripts natifs.                    |
| `warn`  | `((message: string) => void) \| undefined` | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations. |
| `local` | `boolean \| undefined`                     | Optionnel | Utilise l’accès local hôte aux transcripts au lieu d’un transfert par le bail de sandbox.        |

## Signature

```ts
export type CaptureOptions = {
  home?: string;
  warn?: (message: string) => void;
  local?: boolean;
};
```
