---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type        | Présence | Rôle                                                                                                                                                                                             |
| --------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness` | `Harness`   | Requis   | Harness intégré d’Outpost avec son fournisseur de modèles.                                                                                                                                       |
| `model`   | `ModelSpec` | Requis   | Nom de modèle ou { name, reasoning, maxOutputTokens }. Le model provider refuse ici reasoning ou les limites de sortie non pris en charge ; le service vérifie le nom du modèle lors de l’appel. |

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
