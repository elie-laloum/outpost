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

| Nom         | Type     | Présence | Rôle                                                                                                                                                                                         |
| ----------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string` | Requis   | Dossier racine, résolu à l’appel de la fabrique ; les objets vont sous objects/ et les verrous sous .outpost/locks. Une racine qui est un lien symbolique fait échouer la première écriture. |

## Signature

```ts
export interface LocalTransportOptions {
  readonly directory: string;
}
```
