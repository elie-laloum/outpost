---
title: "Hub d’observation et OpenTelemetry"
description: "Recevoir en un seul endroit les événements de workflow, d’agent et d’opération d’une exécution entière, et les exporter en traces et métriques OpenTelemetry."
---

## Observer une exécution entière

`observe` suit un seul dispatch ou un seul workflow ([Suivre la progression](../progress/)). Un hub d’observation reçoit tout ce qu’émet une exécution, chaque événement étiqueté selon sa provenance. Créez-le avec des sinks, puis passez-le comme `observation`.

```ts
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, event.kind);
      },
    },
  ],
});
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
const result = await defineWorkflow("review", [review]).start({ observation });
await observation.close();
result.unwrap();
```

Le sink affiche les transitions du workflow, les opérations de sandbox et de Git et les événements de l’agent, dans l’ordre de `seq`. `dispatch()` accepte la même option `observation` pour une tâche isolée.

Chaque sink reçoit une enveloppe :

| Champ    | Contenu                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `seq`    | Un numéro d’ordre, croissant sur le hub et tous les contextes qui en dérivent.                                          |
| `at`     | L’instant ISO auquel Outpost a émis l’événement.                                                                        |
| `source` | `agent`, `harness`, `workflow`, `sandbox`, `git`, `hooks`, `transfer`, `conversation` ou `recovery`.                    |
| `scope`  | Les champs connus `executionId`, `taskKey`, `attempt`, `dispatchId`, `pass`, `subagentId` et le `candidate` spéculatif. |
| `event`  | L’événement lui-même. Filtrez sur `event.kind`.                                                                         |

## Transmettre le contexte à vos propres tâches

`defineAgentTask` et `defineIsolatedTask` rattachent leur dispatch au contexte de la tâche. Dans une tâche écrite avec `defineTask`, passez `context.observation` à chaque dispatch.

```ts
import { defineTask, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const audit = defineTask({
  key: "audit",
  perform: async (context) => {
    const result = await dispatch({
      repository,
      sandboxProvider,
      agent: coder,
      brief: { text: "List outdated dependencies without changing files." },
      signal: context.signal,
      ...(context.observation ? { observation: context.observation } : {}),
    });
    return result.text;
  },
});
```

Sans cela, le dispatch alimente toujours son propre `observe`, mais ses événements n’atteignent jamais le hub. `observation.child(scope, sinks)` dérive un hub qui ajoute des champs de contexte ; les sinks passés à un enfant ne reçoivent que les événements émis sous lui.

La [spéculation](../speculation/) accepte la même option `observation`, et les helpers de [récupération](../recovery/) et de [rétention](../retention/) acceptent un hub en dernier argument.

## Ce que reçoit le hub

Les événements d’agent, décrits dans [Suivre la progression](../progress/), arrivent avec la source `agent` ou `harness`. Le hub y ajoute ces types :

| `event.kind`                          | Contient                                           | Émis quand                                                                                                                                                                          |
| ------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operation`                           | `id`, `name`, `status`, `durationMs`               | Une étape démarre, puis se termine ou échoue : workspace et verrou, acquisition et libération de sandbox, authentification de l’agent, hooks, transferts, conversations, nettoyage. |
| `dispatch-start`, `dispatch-finished` | `status`, `completed`, `commits`, `usage`, `error` | Un dispatch démarre ; il se termine après son nettoyage, y compris en cas d’échec.                                                                                                  |
| `workflow`                            | `event`, un événement de workflow                  | L’exécution, une tâche, une recherche en cache, un tour de boucle, une gate ou un budget change d’état ([Suivre la progression](../progress/)).                                     |
| `command-output`                      | `channel`, `text`                                  | Une commande `defineCommandTask` écrit sur stdout ou stderr.                                                                                                                        |
| `candidate`                           | `status`                                           | La [spéculation](../speculation/) valide, accepte, rejette ou nettoie un candidat.                                                                                                  |
| `queue`                               | `id`, `status`                                     | Une [tâche en file](../job-queues/) est envoyée, interrogée, terminée ou en échec.                                                                                                  |
| `workspace-commits`                   | `baseline`, `commits`                              | Un journal rejouable enregistre les commits de l’agent ([Rejouer sans modèle](../record-replay/)).                                                                                  |

Un événement `operation` associe `started` à `finished` ou `failed` par son `id`. Seul l’événement terminal porte `durationMs`.

### Événements du harness intégré

Le [harness intégré](../harness/) rend compte de sa boucle avec ces types. Ils atteignent aussi `observe`.

| `event.kind`                      | Émis quand                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `step`                            | Une nouvelle étape du modèle commence.                                                                              |
| `subagent`                        | Un [sous-agent](../subagents/) démarre, se termine ou échoue ; ses événements portent `scope.subagentId`.           |
| `tool-denied`                     | Une [permission ou un hook](../harness-permissions/) refuse un appel d’outil ; `reason` en donne la raison.         |
| `stop-prevented`                  | Un hook d’arrêt renvoie le modèle au travail avec `message`.                                                        |
| `compaction`                      | L’historique est compacté ; `strategy` et `messages` la décrivent.                                                  |
| `skills-loaded`                   | Des [skills](../harness-context/) sont chargés ; `names` les liste.                                                 |
| `tool-output`                     | Une commande lancée par un outil dans la sandbox écrit sur stdout ou stderr, par blocs de 8 192 caractères au plus. |
| `model-request`, `model-response` | Le modèle est appelé. Émis seulement si le hub a été créé avec `verbose: true`.                                     |

`tool-result` ne conserve qu’un `preview` de 2 000 caractères ; abonnez-vous à `tool-output` pour le flux complet.

:::caution
`model-request`, `model-response` et `tool-output` peuvent contenir du contenu du dépôt et des secrets lus par l’agent. Tenez-les à l’écart des journaux publics.
:::

## Livraison et erreurs

Un sink qui ne renvoie rien s’exécute pendant l’émission : gardez-le rapide. Un sink qui renvoie une promesse dispose de sa propre file ordonnée. Le `flush()` facultatif d’un sink s’exécute chaque fois que le hub se vide.

| Situation                                                                 | Conséquence                                                                               |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| La file d’un sink contient déjà `capacity` événements (1 024 par défaut). | Les nouveaux événements pour ce sink sont perdus et `dropped` augmente.                   |
| Une livraison dépasse `deliveryTimeoutMs` (5 000 par défaut).             | Le sink est désactivé. Sa promesse en cours continue de s’exécuter.                       |
| Un sink lève une exception ou rejette.                                    | L’erreur rejoint `errors` et les `observerErrors` de l’exécution, qui n’est pas affectée. |

`dispatch()` et `start()` vident leurs livraisons avant de rendre la main. `flush()` vide le hub à tout moment ; `close()` le vide et cesse d’accepter des événements.

```ts
import {
  createObservationHub,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const observation = createObservationHub({
  deliveryTimeoutMs: 2_000,
  sinks: [
    {
      async observe({ seq, event }) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        console.log(seq, event.kind);
      },
    },
  ],
});
const greet = defineTask({ key: "greet", perform: () => "hello" });
const result = await defineWorkflow("greet", [greet]).start({ observation });
await observation.close();
console.log(result.status, observation.dropped, observation.errors.length);
```

<!-- check:run -->

Le sink affiche les événements `workflow` numérotés, puis le script affiche `done 0 0`. Vérifiez `dropped` et `errors` avant de considérer une trace comme complète.

## Quand la sortie de l’agent est trop volumineuse

Une ligne de protocole de plus de 16 Mio arrête un agent CLI. Le hub et `observe` reçoivent un événement `raw` avec ses 2 000 premiers caractères, `bytes` et `truncated: true`, puis `stopped` avec la raison `oversized-event`. Le dispatch échoue avec le code `process` ([Erreurs](../error-handling/)).

## Exporter vers OpenTelemetry

Installez `@opentelemetry/api` et un SDK OpenTelemetry, puis enregistrez le SDK et ses exportateurs avant de créer l’observateur. Son `sink` transforme les événements du hub en spans liés et en métriques.

```ts
import { metrics, trace } from "@opentelemetry/api";
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
const observation = createObservationHub({ sinks: [telemetry.sink] });
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
await defineWorkflow("review", [review]).start({ observation });
await observation.close();
telemetry.close();
```

La trace imbrique les spans `outpost.workflow`, `outpost.task`, `outpost.task.attempt` et `outpost.dispatch`, avec un span par opération, par exemple `outpost.sandbox.acquire`. Sans SDK enregistré, les objets de l’API n’exportent rien.

| Métrique                                                                                                           | Mesure                                                          |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `outpost.workflow.executions`, `outpost.task.executions`, `outpost.dispatch.executions`                            | Exécutions, tâches et dispatchs terminés, par `outpost.status`. |
| `outpost.task.attempts`, `outpost.task.retries`                                                                    | Tentatives démarrées et nouvelles tentatives.                   |
| `outpost.workflow.duration`, `outpost.task.duration`, `outpost.task.attempt.duration`, `outpost.dispatch.duration` | Des durées en secondes, par `outpost.status`.                   |
| `outpost.agent.tokens`, `outpost.dispatch.tokens`                                                                  | Des tokens, par `outpost.token.type`.                           |

`telemetry.close()` termine les spans encore ouverts. Votre application vide et arrête le SDK. Passez `onError` pour recevoir les erreurs d’instrumentation ; elles ne changent jamais le résultat d’une exécution.

### Sans hub

Passez l’observateur comme `telemetry` à `start()` pour les spans de workflow, de tâche et de tentative, ou à `dispatch()` pour un span de dispatch. Les spans d’opération nécessitent le hub.

:::caution
Branchez l’observateur une seule fois par exécution : passer à la même exécution `telemetry` et un hub contenant `telemetry.sink` duplique ses spans et ses métriques.
:::

## Traiter les événements d’agent de façon asynchrone

`createCustomReporter()` construit un callback `observe` à partir de handlers indexés par type d’événement. Les handlers peuvent être asynchrones ; ils passent par une file bornée, comme les sinks du hub.

```ts
import { appendFile } from "node:fs/promises";
import { createCustomReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const report = createCustomReporter({
  async tool(event) {
    await appendFile("tools.log", `${event.at} ${event.name}\n`);
  },
});
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: report,
});
await report.flush();
```

Le dispatch attend les handlers en cours avant de rendre la main et signale la première erreur de handler dans `result.observerErrors`. `report.flush()` relance cette erreur. Le second argument accepte `onError`, appelé à chaque échec, ainsi que `capacity` et `deliveryTimeoutMs` pour la file.

## Limites

- Le hub est un flux en mémoire et en direct : il ne stocke rien, et un sink lent perd des événements. Pour relire les événements après l’exécution, utilisez le [journal](../journals/) du dispatch.
- Un sink désactivé le reste pendant toute la vie du hub, et `errors` conserve les 100 premières erreurs.
- Un hub fermé ignore les nouveaux événements. Un hub réutilisé entre plusieurs exécutions conserve ses `errors` et son compteur `dropped` : les `observerErrors` de chaque exécution incluent alors les erreurs précédentes.
- Les événements émis sur un [worker](../job-queues/) distant restent sur le hub de ce worker.

API : [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [Observation](../../reference/observation/) · [ObservationEvent](../../reference/observationevent/) · [OperationEvent](../../reference/operationevent/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [OpenTelemetryObserver](../../reference/opentelemetryobserver/) · [createCustomReporter](../../reference/createcustomreporter/).
