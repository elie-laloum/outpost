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

| Nom           | Type          | Présence | Rôle                                                                                                                                                    |
| ------------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`      | Requis   | Nom d’outil unique présenté au modèle parent, composé de 1 à 64 lettres, chiffres, tirets ou underscores.                                               |
| `description` | `string`      | Requis   | Explique quand le parent doit déléguer à cet enfant ; transmis avec le schéma de l’outil.                                                               |
| `agent`       | `CustomAgent` | Requis   | Agent intégré créé avec agent({ harness: harness(...), model }) ; définit les instructions, outils et limites de l’enfant. Les agents CLI sont refusés. |

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
