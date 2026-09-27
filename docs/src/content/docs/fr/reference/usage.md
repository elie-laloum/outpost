---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Usage } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                   | Présence  | Rôle                                                                                                                                                                                                                                                                                   |
| -------------- | ---------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `complete`     | `boolean \| undefined` | Optionnel | False lorsqu’une partie de l’usage n’a pas pu être mesurée ; les compteurs représentent alors une borne inférieure. L’absence ou true conserve la sémantique de l’usage rapporté sans certifier la facturation externe. False persiste dans les agrégations et reprises de checkpoint. |
| `input`        | `number`               | Requis    | Tokens d’entrée rapportés pour l’exécution de l’agent.                                                                                                                                                                                                                                 |
| `cached`       | `number`               | Requis    | Tokens d’entrée rapportés comme servis depuis le cache du modèle.                                                                                                                                                                                                                      |
| `cacheCreated` | `number \| undefined`  | Optionnel | Tokens rapportés comme écrits dans le cache du modèle lorsque le protocole les fournit.                                                                                                                                                                                                |
| `output`       | `number`               | Requis    | Tokens de sortie rapportés comme générés par le modèle.                                                                                                                                                                                                                                |

## Signature

```ts
export interface Usage {
  readonly complete?: boolean;
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```
