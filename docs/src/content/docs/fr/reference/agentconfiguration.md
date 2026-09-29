---
title: "AgentConfiguration"
description: "AgentConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentConfiguration } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                           | Présence | Rôle                                                                                                 |
| ------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `files` | `readonly ConfigurationFile[]` | Requis   | Fichiers JSON à fusionner dans le home de l’agent. Une liste vide ne fait que valider les variables. |

## Signature

```ts
export interface AgentConfiguration {
  readonly files: readonly ConfigurationFile[];
}
```

## Contrats associés

- [ConfigurationFile](../configurationfile/)
