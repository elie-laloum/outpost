---
title: "WorkspaceRuntimeOptions"
description: "WorkspaceRuntimeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRuntimeOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                                     |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `directory` | `string \| undefined` | Optionnel | Racine de contrôle ; .outpost dans le répertoire courant par défaut en TypeScript, à côté de la configuration en YAML 3. |
| `namespace` | `string \| undefined` | Optionnel | Namespace logique du projet ; une valeur explicite est exigée pour la conservation portable.                             |

## Signature

```ts
export interface WorkspaceRuntimeOptions {
  readonly directory?: string;
  readonly namespace?: string;
}
```
