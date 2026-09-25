---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                    | Présence  | Rôle                                                                         |
| --------- | --------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                       |
| `verbose` | `boolean \| undefined`                  | Optionnel | Inclut les événements détaillés d’agent et d’outils dans la sortie terminal. |
| `quiet`   | `boolean \| undefined`                  | Optionnel | Masque toutes les sorties du rapporteur, y compris avertissements et échecs. |
| `write`   | `((text: string) => void) \| undefined` | Optionnel | Fonction de destination personnalisée pour la sortie formatée du rapporteur. |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
