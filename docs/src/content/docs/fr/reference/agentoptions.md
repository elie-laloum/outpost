---
title: "AgentOptions"
description: "AgentOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                                  | Présence          | Rôle                                                                                                                                                                     |
| --------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness` | `CliHarness \| Harness`               | Requis            | Preset CLI comme createClaudeHarness(), ou createHarness() pour la boucle intégrée ; toute autre valeur lève le code configuration.                                      |
| `model`   | `ModelSpec \| undefined \| ModelSpec` | Selon la variante | Nom de modèle ou objet AgentModel, vérifié auprès du harness à la composition de l’agent. Omettez-le pour garder le défaut natif d’une CLI ; le harness intégré l’exige. |

## Signature

```ts
export type AgentOptions = CliAgentOptions | CustomAgentOptions;
```

## Contrats associés

- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgentOptions](../support-customagentoptions/)
