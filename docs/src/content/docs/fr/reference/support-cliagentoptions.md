---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type                     | Présence  | Rôle                                                                                                                                                                                                                                                |
| --------- | ------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness`             | Requis    | Preset CLI à associer au modèle sélectionné.                                                                                                                                                                                                        |
| `model`   | `ModelSpec \| undefined` | Optionnel | Nom du modèle, ou objet AgentModel avec raisonnement et limite de sortie optionnels. Le harness ou le fournisseur qui exécute valide les valeurs prises en charge à la composition de l’agent. Son absence conserve le modèle par défaut de la CLI. |

## Signature

```ts
export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: ModelSpec;
}
```

## Contrats associés

- [CliHarness](../cliharness/)
- [ModelSpec](../modelspec/)
