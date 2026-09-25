---
title: "CliHarness"
description: "CliHarness — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CliHarness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type                                   | Présence | Rôle                                                                                                                                                                    |
| ------ | -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind` | `"cli"`                                | Requis   | Discriminant d’exécution : cli.                                                                                                                                         |
| `bind` | `(model?: AgentModel) => AgentAdapter` | Requis   | Construit l’adaptateur CLI pour un AgentModel normalisé optionnel sans lancer le programme ; un raisonnement ou une limite de sortie non pris en charge est refusé ici. |

## Signature

```ts
export interface CliHarness {
  readonly kind: "cli";
  bind(model?: AgentModel): AgentAdapter;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [AgentModel](../agentmodel/)
