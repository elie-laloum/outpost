---
title: "createReporter"
description: "createReporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createReporter } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un callback observe qui affiche une ligne par événement : phases, appels d’outils, avertissements, échecs et le résumé de chaque passe avec ses compteurs de tokens. Il écrit sur process.stdout sauf si write est fourni, et ne modifie jamais l’exécution.

[Exemple complet et règles détaillées](../../guide/observability/).

## Paramètres et propriétés

| Nom               | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                    |
| ----------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optionnel | Libellé de sortie, verbosité, mode silencieux et fonction d’écriture personnalisée optionnelle.                                                                                                                                         |
| `options.label`   | `string \| undefined`                   | Optionnel | Préfixe affiché entre crochets sur chaque ligne, outpost par défaut ; le numéro de passe le suit.                                                                                                                                       |
| `options.verbose` | `boolean \| undefined`                  | Optionnel | Affiche aussi les entrées d’outils et aperçus de résultats, les prompts, les lignes brutes du protocole, les identifiants de conversation, les étapes et compactions du harness, le répertoire du workspace et les opérations réussies. |
| `options.quiet`   | `boolean \| undefined`                  | Optionnel | Masque toutes les sorties du rapporteur, y compris avertissements et échecs.                                                                                                                                                            |
| `options.write`   | `((text: string) => void) \| undefined` | Optionnel | Reçoit chaque morceau de sortie formaté à la place de process.stdout.                                                                                                                                                                   |

## Retour

`(event: ObservationEvent & ReportPass) => void`

## Signature

```ts
export declare function createReporter(
  options?: ReporterOptions,
): (event: ObservationEvent & ReportPass) => void;
```

## Contrats associés

- [ObservationEvent](../observationevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
