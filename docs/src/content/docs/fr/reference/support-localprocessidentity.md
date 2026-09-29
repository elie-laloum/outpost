---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                                                                                        |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`      | `string` | Requis   | SHA-256 de l’identifiant de machine (/etc/machine-id) ; une autre valeur signifie que le propriétaire tournait sur un autre hôte.           |
| `boot`      | `string` | Requis   | Identifiant de démarrage du noyau ; une autre valeur signifie que le PID date d’un démarrage précédent.                                     |
| `namespace` | `string` | Requis   | Espace de noms PID du processus, comme pid:[4026531836] ; un autre espace de noms rend inconnue la possession des verrous et des activités. |
| `started`   | `string` | Requis   | Heure de début du processus en ticks d’horloge depuis le démarrage, lue dans /proc ; une différence signifie que le PID a été réutilisé.    |

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
