---
title: "FileRunReport"
description: "FileRunReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileRunReport } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                              | Présence | Rôle                                                                                                                                                                                                                                      |
| ----------------- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `2`                               | Requis   | Version 2 du format de rapport d’exécution de fichiers, distincte de la version 1 des rapports Git legacy.                                                                                                                                |
| `workspaceInfo`   | `FileWorkspaceRecord`             | Requis   | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                                                                                                                     |
| `fileOutputs`     | `readonly WorkspacePublication[]` | Requis   | Résultats de publication vérifiés, séparés des commits Git et de l’intégration de branche.                                                                                                                                                |
| `text`            | `string`                          | Requis   | Réponse finale du dispatch, concaténée entre les passes froides et masquée par les expressions redact héritées. Le Markdown la rend comme du texte littéral.                                                                              |
| `usage`           | `Usage`                           | Requis   | Usage déclaré cumulé en tokens, avec réparations, instructions en cours de run, tentatives de secours et sous-agents ; des compteurs nuls seuls ne prouvent pas une absence de consommation.                                              |
| `completed`       | `boolean`                         | Requis   | Indique si le dispatch a satisfait sa condition de fin ; ne certifie ni la réussite des tests ni celle des outils.                                                                                                                        |
| `cost`            | `UsageCost \| null`               | Requis   | Estimation issue des prices du dispatch et de l’usage cumulé par modèle, ou null sans tarifs ou si le calcul échoue. complete=false signale des coûts connus partiels ; ce n’est jamais une facture.                                      |
| `durationMs`      | `number`                          | Requis   | Durée totale du dispatch en millisecondes, avec préparation, exécution, synchronisation et nettoyage des ressources possédées ; un dispatch chaud garde les ressources empruntées ouvertes.                                               |
| `failedTools`     | `readonly RunReportFailure[]`     | Requis   | Jusqu’à 100 événements tool-result échoués dans l’ordre d’observation, associés aux appels par dispatch, passe, sous-agent et identifiant. Inclut les outils shell et les autres ; les événements absents d’un agent ne sont pas déduits. |
| `omittedFailures` | `number`                          | Requis   | Nombre d’échecs observés au-delà de la limite de 100 entrées du rapport ; ils n’apparaissent pas dans failedTools.                                                                                                                        |
| `warnings`        | `readonly string[]`               | Requis   | Limites de collecte : statistiques Git indisponibles, observations perdues, descriptions tronquées ou coût impossible à calculer. Elles ne changent pas la réussite du dispatch.                                                          |

## Signature

```ts
export interface FileRunReport extends Omit<
  RunReport,
  "version" | "branch" | "commits" | "diff"
> {
  readonly version: 2;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly fileOutputs: readonly WorkspacePublication[];
}
```

## Contrats associés

- [RunReport](../runreport/)
