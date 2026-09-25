---
title: "agent"
description: "agent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { agent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Compose un harness et un identifiant de modèle sans lancer de processus ni requête réseau. Un harness CLI peut conserver son modèle par défaut ; un harness personnalisé exige un modèle non vide.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom               | Type                                                             | Présence          | Rôle                                                                               |
| ----------------- | ---------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions \| CustomAgentOptions \| AgentOptions`          | Requis            | Harness et sélection de modèle à composer en un agent exécutable.                  |
| `options.harness` | `CliHarness \| CustomHarness \| CliHarness \| CustomHarness`     | Requis            | Preset CLI à associer au modèle sélectionné.                                       |
| `options.model`   | `string \| undefined \| string \| string \| undefined \| string` | Selon la variante | Identifiant non vide transmis tel quel ; son absence conserve le défaut de la CLI. |

## Retour

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function agent(options: CliAgentOptions): CliAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
