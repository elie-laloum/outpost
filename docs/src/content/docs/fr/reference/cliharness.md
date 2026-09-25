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

| Nom    | Type                               | Présence | Rôle                                                                          |
| ------ | ---------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `kind` | `"cli"`                            | Requis   | Discriminant d’exécution : cli.                                               |
| `bind` | `(model?: string) => AgentAdapter` | Requis   | Construit l’adaptateur CLI pour un modèle optionnel sans lancer le programme. |

## Signature

```ts
export interface CliHarness {
  readonly kind: "cli";
  bind(model?: string): AgentAdapter;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
