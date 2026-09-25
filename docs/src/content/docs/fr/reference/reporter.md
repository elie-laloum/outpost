---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { reporter } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un callback d’observation qui formate progression, avertissements et bilans de passe pour un terminal ou une fonction d’écriture. quiet masque toutes les sorties et verbose inclut des événements supplémentaires ; le rapporteur ne pilote pas l’exécution.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom               | Type                                    | Présence  | Rôle                                                                                            |
| ----------------- | --------------------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optionnel | Libellé de sortie, verbosité, mode silencieux et fonction d’écriture personnalisée optionnelle. |
| `options.label`   | `string \| undefined`                   | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                          |
| `options.verbose` | `boolean \| undefined`                  | Optionnel | Inclut les événements détaillés d’agent et d’outils dans la sortie terminal.                    |
| `options.quiet`   | `boolean \| undefined`                  | Optionnel | Masque toutes les sorties du rapporteur, y compris avertissements et échecs.                    |
| `options.write`   | `((text: string) => void) \| undefined` | Optionnel | Fonction de destination personnalisée pour la sortie formatée du rapporteur.                    |

## Retour

`(event: AgentEvent & ReportPass) => void`

## Signature

```ts
export declare function reporter(
  options?: ReporterOptions,
): (event: AgentEvent & ReportPass) => void;
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
