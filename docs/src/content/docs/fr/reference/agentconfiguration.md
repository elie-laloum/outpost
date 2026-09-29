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

| Nom     | Type                                        | Présence  | Rôle                                                                                                                                                                                                            |
| ------- | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files` | `readonly ConfigurationFile[]`              | Requis    | Fichiers JSON à fusionner dans le home de l’agent. Une liste vide ne fait que valider les variables.                                                                                                            |
| `host`  | `readonly HostConfiguration[] \| undefined` | Optionnel | Fichiers de l’hôte lus avec les garde-fous des fichiers d’identifiants, filtrés par select puis fusionnés dans le home de l’agent. Ils sont ignorés avec le fournisseur local, où la CLI lit le home de l’hôte. |

## Signature

```ts
export interface AgentConfiguration {
  readonly files: readonly ConfigurationFile[];
  readonly host?: readonly HostConfiguration[];
}
```

## Contrats associés

- [ConfigurationFile](../configurationfile/)
- [HostConfiguration](../hostconfiguration/)
