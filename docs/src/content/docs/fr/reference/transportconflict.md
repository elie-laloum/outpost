---
title: "TransportConflict"
description: "TransportConflict — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { TransportConflict } from "@elie-laloum/outpost";
```

## Rôle et comportement

Une mutation conditionnelle ou une lecture versionnée a trouvé une révision différente. Relire l’état avant de décider si une nouvelle tentative est valable ; ne jamais remplacer la condition par une écriture inconditionnelle.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                     |
| --------- | --------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `key`     | `string`              | Requis    | Clé logique dont la révision attendue ne correspondait pas à l’objet stocké.             |
| `name`    | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript. |
| `message` | `string`              | Requis    | Explication lisible de l’échec.                                                          |
| `stack`   | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                         |
| `cause`   | `unknown`             | Optionnel | Échec d’origine attaché à cette erreur.                                                  |

## Signature

```ts
export declare class TransportConflict extends Error {
  readonly key: string;
  constructor(key: string);
}
```
