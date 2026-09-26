---
title: "ModelToolSpec"
description: "ModelToolSpec — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : messages, appels d’outils et raisonnement rejouable neutres vis-à-vis du fournisseur. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelToolSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                | Présence | Rôle                                                                         |
| ------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `name`        | `string`                            | Requis   | Nom d’outil unique de 1 à 64 lettres, chiffres, tirets bas ou tirets.        |
| `description` | `string`                            | Requis   | Explication que le modèle lit pour décider quand et comment appeler l’outil. |
| `inputSchema` | `Readonly<Record<string, unknown>>` | Requis   | Objet JSON Schema qui décrit les arguments de l’outil.                       |

## Signature

```ts
export interface ModelToolSpec {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Readonly<Record<string, unknown>>;
}
```
