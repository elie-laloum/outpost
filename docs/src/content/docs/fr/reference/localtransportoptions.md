---
title: "LocalTransportOptions"
description: "LocalTransportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LocalTransportOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                                                                                                                         |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string` | Requis   | Racine des objets et verrous de mutation locaux ; résolue à l’appel de la fabrique. Les dossiers symboliques sont refusés. Ce format diffère des anciens stores de fichiers. |

## Signature

```ts
export interface LocalTransportOptions {
  readonly directory: string;
}
```
