---
title: "ReadRunOptions"
description: "ReadRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadRunOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                       | Présence  | Rôle                                                                                                     |
| ------------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                | Requis    | Transport pointant vers le même emplacement que le récepteur d’exécution.                                |
| `id`          | `string`                   | Requis    | ID de run choisi par l’application à lire sans prendre la propriété d’exécution.                         |
| `signal`      | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `maxBytes`    | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |

## Signature

```ts
export interface ReadRunOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```

## Contrats associés

- [Transport](../transport/)
