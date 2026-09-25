---
title: "CustomHarnessOptions"
description: "CustomHarnessOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomHarnessOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type            | Présence | Rôle                                                                                                                                            |
| --------------- | --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider` | `ModelProvider` | Requis   | Transport de requêtes utilisé par le callback ; aucun catalogue de modèles n’est imposé.                                                        |
| `run`           | `HarnessRun`    | Requis   | Implémentation de l’appelant renvoyant texte et usage optionnel. Elle doit respecter l’annulation et attendre ses opérations sandbox et modèle. |

## Signature

```ts
export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly run: HarnessRun;
}
```

## Contrats associés

- [HarnessRun](../harnessrun/)
- [ModelProvider](../modelprovider/)
