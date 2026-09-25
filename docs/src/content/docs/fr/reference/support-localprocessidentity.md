---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                                                         |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `host`      | `string` | Requis   | Identité d’hôte utilisée pour distinguer les processus de machines différentes.                              |
| `boot`      | `string` | Requis   | Identité de démarrage système utilisée pour détecter les identifiants de processus d’un démarrage précédent. |
| `namespace` | `string` | Requis   | Identité d’espace de noms de processus utilisée pour évaluer la possession locale du verrou.                 |
| `started`   | `string` | Requis   | Identité système de début de processus utilisée pour détecter la réutilisation d’un PID.                     |

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
