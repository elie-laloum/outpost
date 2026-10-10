---
title: "CloudDependencyCache"
description: "CloudDependencyCache — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { CloudDependencyCache } from "@elie-laloum/outpost/providers/vercel";
```

```ts
import type { CloudDependencyCache } from "@elie-laloum/outpost/providers/daytona";
```

## Paramètres et propriétés

| Nom         | Type        | Présence | Rôle                                                                                                                                                                                                                                                                                                                          |
| ----------- | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transport` | `Transport` | Requis   | Transport appartenant à l’appelant, utilisé sur l’hôte pour restaurer avant sandboxReady et archiver avant release. Les identifiants restent sur l’hôte. La publication conditionnelle conserve un snapshot concurrent plus récent ; les autres erreurs de stockage sont propagées tout en tentant la destruction du sandbox. |
| `name`      | `string`    | Requis   | Nom du cache et de son répertoire sous /outpost/cache : jusqu’à 48 lettres minuscules, chiffres ou tirets, commençant par une lettre, unique par provider.                                                                                                                                                                    |
| `key`       | `string`    | Requis   | Clé de compatibilité de 1 à 1024 caractères. La changer sélectionne une nouvelle archive ; le dépôt, l’environnement du provider et les UID/GID du sandbox participent aussi à l’identité.                                                                                                                                    |

## Signature

```ts
export interface CloudDependencyCache extends DependencyCache {
  readonly transport: Transport;
}
```

## Contrats associés

- [DependencyCache](../dependencycache/)
- [Transport](../transport/)
