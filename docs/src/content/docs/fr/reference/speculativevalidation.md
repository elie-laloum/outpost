---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeValidation**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom       | Type                   | Présence | Rôle                                                                             |
| --------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `key`     | `string`               | Requis   | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `result`  | `SpeculativeOutput<T>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `sandbox` | `Sandbox`              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`  | `AbortSignal`          | Requis   | Annulation coopérative de cette opération.                                       |

## Signature

```ts
export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
