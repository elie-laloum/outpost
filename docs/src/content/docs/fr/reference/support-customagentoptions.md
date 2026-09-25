---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type            | Présence | Rôle                                                                                       |
| --------- | --------------- | -------- | ------------------------------------------------------------------------------------------ |
| `harness` | `CustomHarness` | Requis   | Harness personnalisé avec son fournisseur de modèles.                                      |
| `model`   | `string`        | Requis   | Identifiant non vide requis transmis au fournisseur ; le service vérifie sa disponibilité. |

## Signature

```ts
export interface CustomAgentOptions {
  readonly harness: CustomHarness;
  readonly model: string;
}
```

## Contrats associés

- [CustomHarness](../type-customharness/)
