---
title: "DecisionProvider"
description: "DecisionProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                            | Présence  | Rôle                                                                                                                                             |
| ---------- | --------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`     | `string`                                                        | Requis    | Nom non vide du provider inclus dans les résultats et observations de décision.                                                                  |
| `identity` | `string \| undefined`                                           | Optionnel | Identité stable facultative d’endpoint pour les diagnostics et empreintes applicatives.                                                          |
| `request`  | `(request: DecisionRequest) => Promise<DecisionProviderResult>` | Requis    | Exécuter une évaluation avec annulation de l’appelant ; renvoyer les réponses natives et l’usage disponible sans nouvelle tentative automatique. |

## Signature

```ts
export interface DecisionProvider {
  readonly name: string;
  readonly identity?: string;
  request(request: DecisionRequest): Promise<DecisionProviderResult>;
}
```

## Contrats associés

- [DecisionProviderResult](../decisionproviderresult/)
- [DecisionRequest](../decisionrequest/)
