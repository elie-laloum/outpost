---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 10
---

Contrat public de **reporter**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { reporter } from "@elie-laloum/outpost";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom               | Type                                    | Présence  | Rôle                                                                                          |
| ----------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.label`   | `string \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.verbose` | `boolean \| undefined`                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.quiet`   | `boolean \| undefined`                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.write`   | `((text: string) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
