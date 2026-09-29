---
title: "SpeculationDurability"
description: "SpeculationDurability — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculationDurability } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                              | Présence  | Rôle                                                                                                                                                                                        |
| ------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                       | Requis    | Transport de l’appelant stockant les checkpoints conditionnels ; choisir createLocalTransport sous .outpost/storage du dépôt ou un transport distant explicite.                             |
| `runId`       | `string`                          | Requis    | Identifiant stable non vide permettant de retrouver et posséder exclusivement cette course entre appels.                                                                                    |
| `version`     | `string`                          | Requis    | Version non vide des entrées/implémentations ; la changer si les agents, la validation, la configuration du provider ou leur sémantique changent. Les reprises incompatibles sont refusées. |
| `resume`      | `"retry-incomplete" \| undefined` | Optionnel | Autorisation explicite retry-incomplete pour rejouer les candidats interrompus et leurs effets possibles. Les candidats terminés sont conservés.                                            |

## Signature

```ts
export interface SpeculationDurability {
  readonly transporter: Transport;
  readonly runId: string;
  readonly version: string;
  readonly resume?: "retry-incomplete";
}
```

## Contrats associés

- [Transport](../transport/)
