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

Compose un harness et un modèle sans lancer de processus ni requête réseau. Le modèle est un nom ou un objet AgentModel ; le harness ou son fournisseur refuse immédiatement un niveau de raisonnement ou une limite de sortie non pris en charge. Un harness CLI peut conserver son modèle par défaut ; un harness personnalisé en exige un.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom               | Type                                                                         | Présence          | Rôle                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions \| CustomAgentOptions \| AgentOptions`                      | Requis            | Harness et sélection de modèle à composer en un agent exécutable.                                                                                                                                                                                   |
| `options.harness` | `CliHarness \| CustomHarness \| CliHarness \| CustomHarness`                 | Requis            | Preset CLI à associer au modèle sélectionné.                                                                                                                                                                                                        |
| `options.model`   | `ModelSpec \| undefined \| ModelSpec \| ModelSpec \| undefined \| ModelSpec` | Selon la variante | Nom du modèle, ou objet AgentModel avec raisonnement et limite de sortie optionnels. Le harness ou le fournisseur qui exécute valide les valeurs prises en charge à la composition de l’agent. Son absence conserve le modèle par défaut de la CLI. |

## Retour

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function agent(options: CliAgentOptions): CliAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
