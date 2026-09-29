---
title: "Observabilité — Vue d’ensemble"
description: "Suivez ce que fait un dispatch ou un workflow grâce aux événements d’agent, aux sinks du hub, aux reporters, à la télémétrie, aux journaux et à l’usage de tokens."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un observateur

Chaque observateur reçoit des copies des événements. Ses erreurs sont collectées, dans `observerErrors` ou `onError`, et ne changent jamais le résultat d’une exécution.

| Observateur                       | Passé comme                                  | Reçoit                                                         | À utiliser pour                                   |
| --------------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| `createReporter()`                | `observe` d’un dispatch                      | Les événements d’agent d’un dispatch                           | Des lignes de progression dans le terminal        |
| `createCustomReporter(handlers)`  | `observe` d’un dispatch                      | Les événements d’agent, routés par `kind`                      | Votre logger, avec une barrière `flush()`         |
| `createObservationHub({ sinks })` | `observation` d’un workflow ou d’un dispatch | Chaque événement de l’exécution, avec `seq` et `scope`         | Un flux ordonné unique entre tâches et opérations |
| `createOpenTelemetryObserver()`   | Son `sink` sur un hub, ou `telemetry`        | Le cycle de vie des workflows, tâches, dispatchs et opérations | Des spans et des métriques                        |
| Réglages `logging`                | `logging` d’un dispatch                      | Les événements du dispatch, stockés via un transport           | Un journal à lire avec `readJournal()`            |
| `createReplayAgent({ journal })`  | `agent` d’un dispatch                        | Un journal enregistré                                          | Rejouer un dispatch sans modèle                   |

:::caution
La livraison est en direct et bornée, journal compris : un récepteur qui prend du retard perd des événements. La perte apparaît dans `observerErrors` et dans le compteur `dropped` du hub.
:::

## Quand arrive l’usage de tokens

Un événement `usage` porte un incrément ; le `summary` d’une passe et le résultat du dispatch portent les totaux. `Usage.complete: false` signale des compteurs qui sont une borne inférieure.

| Agent           | Usage rapporté                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Claude Code     | À la fin de chaque tour ; `message-usage` par message n’est pas compté                           |
| Codex           | À la fin de chaque tour ; après chaque réponse du modèle quand le steering injecte des consignes |
| Copilot CLI     | Après chaque réponse du modèle, puis réconcilié avec le total de session à la sortie             |
| Kimi Code       | Une fois, lu dans la session après la sortie de la CLI                                           |
| Antigravity     | À la fin de chaque tour                                                                          |
| Harness intégré | Après chaque réponse du modèle, sous-agents compris                                              |

Les totaux et budgets de workflow reposent sur ces compteurs : voir [WorkflowUsage](../../workflowusage/).

## Points d’entrée

Guide : [Hub d’observation et OpenTelemetry](../../../guide/observability/) · [Suivre la progression](../../../guide/progress/) · [Journaux](../../../guide/journals/)

- [createObservationHub](../../createobservationhub/)
- [createReporter](../../createreporter/)
- [createCustomReporter](../../createcustomreporter/)
- [createOpenTelemetryObserver](../../createopentelemetryobserver/)
- [createReplayAgent](../../createreplayagent/)
- [ObservationHub](../../observationhub/)
- [Observation](../../observation/)
- [AgentEvent](../../agentevent/)
- [AgentObservation](../../agentobservation/)
- [Usage](../../usage/)
- [Logging](../../logging/)
- [DispatchTelemetry](../../dispatchtelemetry/)
