---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Cette première phase effectue des appels HTTP textuels sans Codex. Le harness d’agent est prévu en phase deux : l’exécution d’outils, la modification du dépôt et la persistance des conversations ne sont pas implémentées. Cette API ne peut pas servir d’agent de dispatch ni de provider de sandbox ; son contrat peut évoluer. Consultez le [périmètre implémenté et le harness prévu](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                              | Présence | Rôle                                                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                          | Requis   | Identité du fournisseur ; le client direct intégré indique openai-compatible.                                                                                                                                                                                                                |
| `generate` | `(request: ModelRequest) => Promise<ModelResult>` | Requis   | Envoie une requête textuelle indépendante et renvoie le texte complet et la consommation observée si présente. Rejette les entrées invalides, erreurs HTTP, annulations, délais dépassés, sorties invalides, refus, troncatures et appels d’outils ; aucune répétition ni exécution d’outil. |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  generate(request: ModelRequest): Promise<ModelResult>;
}
```

## Contrats associés

- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
