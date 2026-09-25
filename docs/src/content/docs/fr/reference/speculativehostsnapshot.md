---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeHostSnapshot**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom           | Type      | Présence | Rôle                                                                             |
| ------------- | --------- | -------- | -------------------------------------------------------------------------------- |
| `head`        | `string`  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `branch`      | `string`  | Requis   | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `fingerprint` | `string`  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `dirty`       | `boolean` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
