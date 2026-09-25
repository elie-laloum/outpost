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

Crée un observateur appelable avec des handlers typés et une barrière flush explicite. Les handlers s’exécutent séquentiellement sans bloquer le dispatch ; onError signale les erreurs et la première reste accessible à chaque flush. Les fichiers, loggers et leur fermeture appartiennent à l’appelant.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom               | Type                                                                                | Présence  | Rôle                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlers`        | `ReporterHandlers`                                                                  | Requis    | Handlers optionnels par type d’événement agent, exécutés séquentiellement dans l’ordre d’arrivée ; les types absents sont ignorés.                                |
| `options`         | `CustomReporterOptions \| undefined`                                                | Optionnel | Diagnostic des erreurs du reporter personnalisé ; aucun affichage terminal ni prise de propriété des ressources.                                                  |
| `options.onError` | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optionnel | Appelé pour chaque handler en échec avec son erreur et son événement ; les erreurs du diagnostic sont isolées et la première erreur reste accessible via flush(). |

## Retour

`CustomReporter`

## Signature

```ts
export declare function createReporter(
  handlers: ReporterHandlers,
  options?: CustomReporterOptions,
): CustomReporter;
```

## Contrats associés

- [CustomReporter](../customreporter/)
- [CustomReporterOptions](../customreporteroptions/)
- [ReporterHandlers](../reporterhandlers/)
