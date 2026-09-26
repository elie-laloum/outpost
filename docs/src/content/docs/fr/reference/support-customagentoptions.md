---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type        | Présence | Rôle                                                                                                                                                                                           |
| --------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `Harness`   | Requis   | Harness intégré d’Outpost avec son fournisseur de modèles.                                                                                                                                     |
| `model`   | `ModelSpec` | Requis   | Nom de modèle ou objet AgentModel requis. Le fournisseur de modèles valide le raisonnement et la limite de sortie à la composition de l’agent ; le service vérifie la disponibilité du modèle. |

## Signature

```ts
export interface CustomAgentOptions {
  readonly harness: Harness;
  readonly model: ModelSpec;
}
```

## Contrats associés

- [Harness](../type-customharness/)
- [ModelSpec](../modelspec/)
