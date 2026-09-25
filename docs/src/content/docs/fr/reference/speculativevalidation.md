---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                   | Présence | Rôle                                                                                                      |
| --------- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `key`     | `string`               | Requis   | Clé unique du candidat reliant sa branche, sa validation et son résultat final.                           |
| `result`  | `SpeculativeOutput<T>` | Requis   | Sortie de dispatch du candidat avec texte, commits, usage et valeur typée, sans méthodes de continuation. |
| `sandbox` | `Sandbox`              | Requis   | Sandbox active du candidat disponible pour les commandes de validation avant nettoyage.                   |
| `signal`  | `AbortSignal`          | Requis   | Annulation coopérative de cette opération.                                                                |

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
