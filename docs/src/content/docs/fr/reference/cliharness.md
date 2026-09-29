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

| Nom    | Type                                   | Présence | Rôle                                                                                                                                                                                                   |
| ------ | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind` | `"cli"`                                | Requis   | Discriminant d’exécution : cli.                                                                                                                                                                        |
| `bind` | `(model?: AgentModel) => AgentAdapter` | Requis   | Construit l’adapter pour un modèle facultatif sans lancer la CLI ; createAgent() l’appelle. Les réglages de modèle, formes d’authentification et options MCP non pris en charge lèvent une erreur ici. |

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
