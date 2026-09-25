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

| Nom       | Type                            | Présence          | Rôle                                                                                                          |
| --------- | ------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness \| CustomHarness`   | Requis            | Harness d’exécution ; sa variante sélectionne une CLI ou un callback personnalisé.                            |
| `model`   | `string \| undefined \| string` | Selon la variante | Identifiant transmis tel quel au harness. Requis pour un harness personnalisé ; optionnel pour le défaut CLI. |

## Signature

```ts
export type AgentOptions = CliAgentOptions | CustomAgentOptions;
```

## Contrats associés

- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgentOptions](../support-customagentoptions/)
