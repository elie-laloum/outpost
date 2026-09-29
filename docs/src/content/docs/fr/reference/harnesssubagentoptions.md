---
title: "HarnessSubagentOptions"
description: "HarnessSubagentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagentOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type          | Présence | Rôle                                                                                                                                                                                                  |
| ------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`      | Requis   | Nom d’outil unique présenté au modèle parent, composé de 1 à 64 lettres, chiffres, tirets ou underscores.                                                                                             |
| `description` | `string`      | Requis   | Indique au modèle parent quand déléguer à cet enfant ; envoyée avec le schéma de l’outil.                                                                                                             |
| `agent`       | `CustomAgent` | Requis   | Agent intégré issu de createAgent({ harness: createHarness(…), model }) qui fournit les instructions, outils, limites et permissions de l’enfant. Un agent CLI est refusé avec le code configuration. |

## Signature

```ts
export interface HarnessSubagentOptions {
  readonly name: string;
  readonly description: string;
  readonly agent: CustomAgent;
}
```

## Contrats associés

- [CustomAgent](../customagent/)
