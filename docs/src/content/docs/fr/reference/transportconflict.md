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

Levée quand une écriture ou une suppression conditionnelle, ou une lecture fixée sur une révision, trouve une autre révision ou aucun objet ; key nomme l’objet. Relisez l’objet avant de décider s’il faut réessayer.

[Exemple complet et règles détaillées](../../guide/storage/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                                    |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `key`     | `string`              | Requis    | Clé logique dont la révision attendue ne correspondait pas à l’objet stocké.                            |
| `name`    | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                |
| `message` | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`   | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`   | `unknown`             | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class TransportConflict extends Error {
  readonly key: string;
  constructor(key: string);
}
```
