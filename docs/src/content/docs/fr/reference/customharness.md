---
title: "customHarness"
description: "customHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { customHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un callback fourni par l’appelant et relié à un fournisseur de modèles. Le callback tourne dans le processus Outpost et utilise le sandbox fourni pour le dépôt. Aucune boucle d’outils, conversation native ou session terminal n’est fournie.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                     | Type                   | Présence | Rôle                                                                                                                                            |
| ----------------------- | ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `CustomHarnessOptions` | Requis   | Fournisseur de modèles et callback portés par cette configuration de harness personnalisé.                                                      |
| `options.modelProvider` | `ModelProvider`        | Requis   | Transport de requêtes utilisé par le callback ; aucun catalogue de modèles n’est imposé.                                                        |
| `options.run`           | `HarnessRun`           | Requis   | Implémentation de l’appelant renvoyant texte et usage optionnel. Elle doit respecter l’annulation et attendre ses opérations sandbox et modèle. |

## Retour

`CustomHarness`

## Signature

```ts
export declare function customHarness(
  options: CustomHarnessOptions,
): CustomHarness;
```

## Contrats associés

- [CustomHarness](../type-customharness/)
- [CustomHarnessOptions](../customharnessoptions/)
