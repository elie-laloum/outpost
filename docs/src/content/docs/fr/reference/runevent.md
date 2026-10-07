---
title: "RunEvent"
description: "RunEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type               | Présence | Rôle                                                                                                 |
| ---------------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `seq`            | `number`           | Requis   | Curseur persistant publié, croissant à travers les reprises de workflows terminés ou suspendus.      |
| `observationSeq` | `number`           | Requis   | Séquence du hub d’origine, pouvant redémarrer avec une nouvelle session d’observation.               |
| `at`             | `string`           | Requis   | Horodatage de l’observation depuis le hub producteur.                                                |
| `source`         | `string`           | Requis   | Libellé de la source d’observation lu depuis le stockage.                                            |
| `scope`          | `ObservationScope` | Requis   | Contexte de routage validé incluant identités de tâche, dispatch, tentative et sous-agent.           |
| `event`          | `unknown`          | Requis   | Charge d’événement persistée et masquée ; validez cette valeur unknown avant d’inspecter ses champs. |

## Signature

```ts
export interface RunEvent {
  readonly seq: number;
  readonly observationSeq: number;
  readonly at: string;
  readonly source: string;
  readonly scope: ObservationScope;
  readonly event: unknown;
}
```

## Contrats associés

- [ObservationScope](../observationscope/)
