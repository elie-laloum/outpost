---
title: "ModelToolResultBlock"
description: "ModelToolResultBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
:::

## Import

```ts
import type { ModelToolResultBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                   | Présence  | Rôle                                                                           |
| --------- | ---------------------- | --------- | ------------------------------------------------------------------------------ |
| `type`    | `"tool-result"`        | Requis    | Discriminant du bloc : tool-result.                                            |
| `callId`  | `string`               | Requis    | Identifiant de l’appel d’outil auquel ce résultat répond.                      |
| `content` | `string`               | Requis    | Texte renvoyé au modèle pour cet appel.                                        |
| `isError` | `boolean \| undefined` | Optionnel | Signale un échec d’exécution de l’outil pour que le modèle puisse se corriger. |

## Signature

```ts
export interface ModelToolResultBlock {
  readonly type: "tool-result";
  readonly callId: string;
  readonly content: string;
  readonly isError?: boolean;
}
```
