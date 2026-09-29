---
title: "createCustomReporter"
description: "createCustomReporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCustomReporter } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un observateur appelable avec des handlers typés et une barrière flush explicite. Les handlers s’exécutent séquentiellement sans bloquer le dispatch ; onError signale les erreurs et la première reste accessible à chaque flush. Les fichiers, loggers et leur fermeture appartiennent à l’appelant.

[Exemple complet et règles détaillées](../../guide/progress/).

## Paramètres et propriétés

| Nom                         | Type                                                                                | Présence  | Rôle                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlers`                  | `ReporterHandlers`                                                                  | Requis    | Handlers optionnels par type d’événement agent, exécutés séquentiellement dans l’ordre d’arrivée ; les types absents sont ignorés.                                |
| `options`                   | `CustomReporterOptions \| undefined`                                                | Optionnel | Diagnostic des erreurs du reporter personnalisé ; aucun affichage terminal ni prise de propriété des ressources.                                                  |
| `options.capacity`          | `number \| undefined`                                                               | Optionnel | Maximum d’événements en attente dans le reporter, 1024 par défaut ; la saturation perd les nouvelles livraisons et fait rejeter flush.                            |
| `options.deliveryTimeoutMs` | `number \| undefined`                                                               | Optionnel | Attente maximale d’un gestionnaire asynchrone en millisecondes, 5000 par défaut ; le dépassement désactive les livraisons suivantes et fait rejeter flush.        |
| `options.onError`           | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optionnel | Appelé pour chaque handler en échec avec son erreur et son événement ; les erreurs du diagnostic sont isolées et la première erreur reste accessible via flush(). |

## Retour

`CustomReporter`

## Signature

```ts
export declare function createCustomReporter(
  handlers: ReporterHandlers,
  options?: CustomReporterOptions,
): CustomReporter;
```

## Contrats associés

- [CustomReporter](../customreporter/)
- [CustomReporterOptions](../customreporteroptions/)
- [ReporterHandlers](../reporterhandlers/)
