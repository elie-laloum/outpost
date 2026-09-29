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

| Nom       | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                    |
| --------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optionnel | Préfixe affiché entre crochets sur chaque ligne, outpost par défaut ; le numéro de passe le suit.                                                                                                                                       |
| `verbose` | `boolean \| undefined`                  | Optionnel | Affiche aussi les entrées d’outils et aperçus de résultats, les prompts, les lignes brutes du protocole, les identifiants de conversation, les étapes et compactions du harness, le répertoire du workspace et les opérations réussies. |
| `quiet`   | `boolean \| undefined`                  | Optionnel | Masque toutes les sorties du rapporteur, y compris avertissements et échecs.                                                                                                                                                            |
| `write`   | `((text: string) => void) \| undefined` | Optionnel | Reçoit chaque morceau de sortie formaté à la place de process.stdout.                                                                                                                                                                   |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
