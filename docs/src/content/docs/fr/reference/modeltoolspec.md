---
title: "ModelToolSpec"
description: "ModelToolSpec — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
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
