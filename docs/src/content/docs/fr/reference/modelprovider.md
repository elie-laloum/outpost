---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
:::

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                              | Présence | Rôle                                                                                                                                          |
| --------- | ------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                          | Requis   | Identité du fournisseur ; le client direct intégré indique openai-compatible.                                                                 |
| `request` | `(request: ModelRequest) => Promise<ModelResult>` | Requis   | Exécute une requête texte bornée pour le modèle fourni. Le wrapper du harness propage l’annulation et comptabilise une fois l’usage rapporté. |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  request(request: ModelRequest): Promise<ModelResult>;
}
```

## Contrats associés

- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
