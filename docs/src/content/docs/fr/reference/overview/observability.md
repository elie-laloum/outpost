---
title: "Observabilité — Vue d’ensemble"
description: "L’observabilité rend l’exécution compréhensible sans décider de son résultat."
sidebar:
  label: Vue d’ensemble
  order: 0
---

L’observabilité rend l’exécution compréhensible sans décider de son résultat. Les événements d’agent décrivent la progression et l’activité native ; l’usage expose les compteurs de tokens rapportés ; reporters et adapters de télémétrie transforment les observations en logs, spans ou métriques.

## Fonctionnement et philosophie

Attachez un observateur à l’opération à examiner. Un reporter met les événements en forme pour une personne ; l’intégration OpenTelemetry optionnelle les relie à l’instrumentation. L’observation est volontairement isolée : une erreur d’observateur ne doit pas décider de la réussite de l’opération.

## Limites et responsabilités

L’usage rapporté n’est pas une facture, et l’activité locale n’est pas l’inventaire d’un compte cloud. Évitez de placer prompts, identifiants secrets ou valeurs sans borne dans les labels de métriques. Utilisez les résultats d’opérations et les validations imposées pour décider de la suite du programme.

## Points d’entrée

- [reporter](../../reporter/)
- [AgentEvent](../../agentevent/)
- [AgentObservation](../../agentobservation/)
- [Usage](../../usage/)
- [openTelemetry](../../opentelemetry/)
- [OpenTelemetryOptions](../../opentelemetryoptions/)

[Passer à la pratique avec le Guide](../../../guide/agents/observability/).
