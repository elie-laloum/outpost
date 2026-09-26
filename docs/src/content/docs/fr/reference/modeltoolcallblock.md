---
title: "ModelToolCallBlock"
description: "ModelToolCallBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

## Import

```ts
import type { ModelToolCallBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type          | Présence | Rôle                                                                                                                                                    |
| ------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`  | `"tool-call"` | Requis   | Discriminant du bloc : tool-call.                                                                                                                       |
| `id`    | `string`      | Requis   | Identifiant d’appel émis par le service, que le résultat correspondant doit référencer.                                                                 |
| `name`  | `string`      | Requis   | Nom de l’outil demandé, tel que déclaré dans les outils de la requête.                                                                                  |
| `input` | `unknown`     | Requis   | Arguments de l’outil analysés. Quand le service renvoie un JSON invalide, la chaîne brute est conservée pour que l’appelant signale l’erreur au modèle. |

## Signature

```ts
export interface ModelToolCallBlock {
  readonly type: "tool-call";
  readonly id: string;
  readonly name: string;
  readonly input: unknown;
}
```
