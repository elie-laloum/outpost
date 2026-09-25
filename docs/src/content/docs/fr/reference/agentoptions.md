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

| Nom       | Type                                  | Présence          | Rôle                                                                                                                                                                                                                                                               |
| --------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness` | `CliHarness \| CustomHarness`         | Requis            | Harness d’exécution ; sa variante sélectionne une CLI ou un callback personnalisé.                                                                                                                                                                                 |
| `model`   | `ModelSpec \| undefined \| ModelSpec` | Selon la variante | Nom du modèle, ou objet AgentModel avec raisonnement et limite de sortie optionnels. Le harness ou le fournisseur qui exécute valide les valeurs prises en charge à la composition de l’agent. Requis pour un harness personnalisé ; optionnel pour le défaut CLI. |

## Signature

```ts
export type AgentOptions = CliAgentOptions | CustomAgentOptions;
```

## Contrats associés

- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgentOptions](../support-customagentoptions/)
