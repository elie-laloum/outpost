---
title: "RunReport"
description: "RunReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReport } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                          | Présence | Rôle                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `1`                           | Requis   | Version du schéma de l’instantané JSON, actuellement 1.                                                                                                                                                                                   |
| `completed`       | `boolean`                     | Requis   | Indique si le dispatch a satisfait sa condition de fin ; ne certifie ni la réussite des tests ni celle des outils.                                                                                                                        |
| `text`            | `string`                      | Requis   | Réponse finale du dispatch, concaténée entre les passes froides et masquée par les expressions redact héritées. Le Markdown la rend comme du texte littéral.                                                                              |
| `branch`          | `string`                      | Requis   | Branche de travail enregistrée avant la fermeture du workspace ; ce n’est pas une URL de pull request.                                                                                                                                    |
| `commits`         | `readonly Commit[]`           | Requis   | Identités et sujets des commits collectés pendant ce dispatch, y compris chaque passe froide.                                                                                                                                             |
| `durationMs`      | `number`                      | Requis   | Durée totale du dispatch en millisecondes, avec préparation, exécution, synchronisation et nettoyage des ressources possédées ; un dispatch chaud garde les ressources empruntées ouvertes.                                               |
| `usage`           | `Usage`                       | Requis   | Usage déclaré cumulé en tokens, avec réparations, instructions en cours de run, tentatives de secours et sous-agents ; des compteurs nuls seuls ne prouvent pas une absence de consommation.                                              |
| `cost`            | `UsageCost \| null`           | Requis   | Estimation issue des prices du dispatch et de l’usage cumulé par modèle, ou null sans tarifs ou si le calcul échoue. complete=false signale des coûts connus partiels ; ce n’est jamais une facture.                                      |
| `diff`            | `RunReportDiff \| null`       | Requis   | Diff commité net figé après synchronisation et avant nettoyage du workspace, ou null si l’inspection échoue. Exclut les fichiers non commités et non suivis.                                                                              |
| `failedTools`     | `readonly RunReportFailure[]` | Requis   | Jusqu’à 100 événements tool-result échoués dans l’ordre d’observation, associés aux appels par dispatch, passe, sous-agent et identifiant. Inclut les outils shell et les autres ; les événements absents d’un agent ne sont pas déduits. |
| `omittedFailures` | `number`                      | Requis   | Nombre d’échecs observés au-delà de la limite de 100 entrées du rapport ; ils n’apparaissent pas dans failedTools.                                                                                                                        |
| `warnings`        | `readonly string[]`           | Requis   | Limites de collecte : statistiques Git indisponibles, observations perdues, descriptions tronquées ou coût impossible à calculer. Elles ne changent pas la réussite du dispatch.                                                          |

## Signature

```ts
export interface RunReport {
  readonly version: 1;
  readonly completed: boolean;
  readonly text: string;
  readonly branch: string;
  readonly commits: readonly Commit[];
  readonly durationMs: number;
  readonly usage: Usage;
  readonly cost: UsageCost | null;
  readonly diff: RunReportDiff | null;
  readonly failedTools: readonly RunReportFailure[];
  readonly omittedFailures: number;
  readonly warnings: readonly string[];
}
```

## Contrats associés

- [Commit](../commit/)
- [RunReportDiff](../runreportdiff/)
- [RunReportFailure](../runreportfailure/)
- [Usage](../usage/)
- [UsageCost](../usagecost/)
