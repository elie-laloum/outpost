---
title: "Suivre les exécutions avec OpenTelemetry"
description: "Collectez les événements d’exécution avec leur contexte et exportez les traces et les métriques."
---

## Observer une exécution entière

Créez un hub d’observation pour réunir les événements du workflow, des agents et des ressources. Ajoutez les fonctions qui recevront les événements, puis passez le hub dans l’option `observation`. Chaque événement contient son contexte d’exécution.

<!-- tabs -->

```ts title="events.ts"
import { reportValue } from "./reporter.ts";
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        reportValue(seq, source, scope.taskKey, event.kind);
        // Example output: 1 agent review phase
      },
    },
  ],
});
```

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
```

```ts title="observe-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";
import { observation } from "./events.ts";

export const result = await defineWorkflow("review", [review]).start({
  observation,
});
await observation.close();
result.unwrap();
```

Le récepteur affiche les transitions du workflow, les opérations de sandbox et de Git et les événements de l’agent, dans l’ordre de `seq`. `dispatch()` accepte la même option `observation` pour une tâche isolée.

L’enveloppe de l’événement inclut le contexte de l’exécution.

Référence API : [Observation](../../reference/observation/).

## Transmettre le contexte à vos propres tâches

`defineAgentTask` et `defineIsolatedTask` rattachent leur dispatch au contexte de la tâche. Dans une tâche écrite avec `defineTask`, passez `context.observation` à chaque dispatch.

```ts
import { defineTask, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

Sans cela, le dispatch alimente toujours son propre `observe`, mais ses événements n’atteignent jamais le hub. `observation.child(scope, sinks)` dérive un hub qui ajoute des champs de contexte ; les récepteurs passés à un enfant ne reçoivent que les événements émis sous lui.

La [spéculation](../speculation/) accepte la même option `observation`, et les fonctions utilitaires de [récupération](../recovery/) et de [rétention](../retention/) acceptent un hub en dernier argument.

## Ce que reçoit le hub

Le hub réunit l’activité des agents, les transitions du workflow et les opérations sur les ressources.

Référence API : [ObservationEvent](../../reference/observationevent/).

Un événement `operation` associe `started` à `finished` ou `failed` par son `id`. Seul l’événement terminal porte `durationMs`.

### Événements du harness intégré

Le [harness intégré](../harness/) rend compte de sa boucle avec ces types. Ils atteignent aussi `observe`.

Référence API : [AgentEvent](../../reference/agentevent/).

`tool-result` ne conserve qu’un `preview` de 2 000 caractères ; abonnez-vous à `tool-output` pour le flux complet.

:::caution
`model-request`, `model-response` et `tool-output` peuvent contenir du contenu du dépôt et des secrets lus par l’agent. Tenez-les à l’écart des journaux publics.
:::

## Livraison et erreurs

Un récepteur qui ne renvoie rien s’exécute pendant l’émission : gardez-le rapide. Un récepteur qui renvoie une promesse dispose de sa propre file ordonnée. Le `flush()` facultatif d’un récepteur s’exécute chaque fois que le hub se vide.

| Situation                                                                      | Conséquence                                                                               |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| La file d’un récepteur contient déjà `capacity` événements (1 024 par défaut). | Les nouveaux événements pour ce récepteur sont perdus et `dropped` augmente.              |
| Une livraison dépasse `deliveryTimeoutMs` (5 000 par défaut).                  | Le récepteur est désactivé. Sa promesse en cours continue de s’exécuter.                  |
| Un récepteur lève une exception ou rejette.                                    | L’erreur rejoint `errors` et les `observerErrors` de l’exécution, qui n’est pas affectée. |

`dispatch()` et `start()` vident leurs livraisons avant de rendre la main. `flush()` vide le hub à tout moment ; `close()` le vide et cesse d’accepter des événements.

<!-- tabs -->

```ts title="slow-observer.ts"
import { reportValue } from "./reporter.ts";
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  deliveryTimeoutMs: 2_000,
  sinks: [
    {
      async observe({ seq, event }) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        reportValue(seq, event.kind);
        // Example output: 1 workflow
      },
    },
  ],
});
```

```ts title="delivery.ts"
import { reportValue } from "./reporter.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { observation } from "./slow-observer.ts";

export const greet = defineTask({ key: "greet", perform: () => "hello" });
export const result = await defineWorkflow("greet", [greet]).start({
  observation,
});
await observation.close();
reportValue(result.status, observation.dropped, observation.errors.length);
// Example output: done 0 0
```

<!-- check:run -->

Le récepteur affiche les événements `workflow` numérotés, puis le script affiche `done 0 0`. Vérifiez `dropped` et `errors` avant de considérer une trace comme complète.

## Traiter une sortie trop volumineuse

Une ligne de protocole de plus de 16 Mio arrête un agent CLI. Le hub et `observe` reçoivent un événement `raw` avec ses 2 000 premiers caractères, `bytes` et `truncated: true`, puis `stopped` avec la raison `oversized-event`. Le dispatch échoue avec le code `process` ([Erreurs](../error-handling/)).

## Exporter vers OpenTelemetry

Installez `@opentelemetry/api` et un SDK OpenTelemetry, puis enregistrez le SDK et ses exportateurs avant de créer l’observateur. Son `sink` transforme les événements du hub en spans liés et en métriques.

<!-- tabs -->

```ts title="telemetry.ts"
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import { trace, metrics } from "@opentelemetry/api";
import { createObservationHub } from "@elie-laloum/outpost";

export const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
export const observation = createObservationHub({ sinks: [telemetry.sink] });
```

```ts title="telemetry-review.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
```

```ts title="observe-telemetry.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./telemetry-review.ts";
import { observation, telemetry } from "./telemetry.ts";

await defineWorkflow("review", [review]).start({ observation });
await observation.close();
telemetry.close();
```

La trace imbrique les spans `outpost.workflow`, `outpost.task`, `outpost.task.attempt` et `outpost.dispatch`, avec un span par opération, par exemple `outpost.sandbox.acquire`. Sans SDK enregistré, les objets de l’API n’exportent rien.

Référence API : [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/).

`telemetry.close()` termine les spans encore ouverts. Votre application vide et arrête le SDK. Passez `onError` pour recevoir les erreurs d’instrumentation ; elles ne changent jamais le résultat d’une exécution.

### Sans hub

Passez l’observateur comme `telemetry` à `start()` pour les spans de workflow, de tâche et de tentative, ou à `dispatch()` pour un span de dispatch. Les spans d’opération nécessitent le hub.

:::caution
Branchez l’observateur une seule fois par exécution : passer à la même exécution `telemetry` et un hub contenant `telemetry.sink` duplique ses spans et ses métriques.
:::

## Traiter les événements d’agent de façon asynchrone

`createCustomReporter()` construit une fonction de rappel `observe` à partir de traitements indexés par type d’événement. Les traitements peuvent être asynchrones ; ils passent par une file limitée, comme les récepteurs du hub.

```ts
import { appendFile } from "node:fs/promises";
import { createCustomReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

Le dispatch attend les traitements en cours avant de rendre la main et signale la première erreur de traitement dans `result.observerErrors`. `report.flush()` relance cette erreur. Le second argument accepte `onError`, appelé à chaque échec, ainsi que `capacity` et `deliveryTimeoutMs` pour la file.

## Limites

- Le hub est un flux en mémoire et en direct : il ne stocke rien, et un récepteur lent perd des événements. Pour relire les événements après l’exécution, utilisez le [journal](../journals/) du dispatch, lui-même un récepteur soumis aux mêmes limites `capacity` et `deliveryTimeoutMs`.
- Un récepteur désactivé le reste pendant toute la vie du hub, et `errors` conserve les 100 premières erreurs.
- Un hub fermé ignore les nouveaux événements. Un hub réutilisé entre plusieurs exécutions conserve ses `errors` et son compteur `dropped` : les `observerErrors` de chaque exécution incluent alors les erreurs précédentes.
- Les événements émis sur un [worker](../job-queues/) distant restent sur le hub de ce worker.

API : [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [Observation](../../reference/observation/) · [ObservationEvent](../../reference/observationevent/) · [OperationEvent](../../reference/operationevent/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [OpenTelemetryObserver](../../reference/opentelemetryobserver/) · [createCustomReporter](../../reference/createcustomreporter/).

## Observer les décisions et sélections

Les [évaluations de décision](../decisions/) émettent des résumés de cycle de vie avec la source `decision`. Les harnesses routés émettent des événements d’agent `model-route` indiquant modèle effectif, motif et confiance native facultative. Passez `observation` à `decide()` pour une évaluation directe ; tâches et harnesses propagent les scopes workflow, tâche, passage et sous-agent. Les états et réponses complets exigent un hub verbose. L’usage valide est compté de façon synchrone, indépendamment des livraisons et erreurs des sinks.

## Masquer les secrets avant sauvegarde ou observation

Passez les expressions à `Workflow.start()` ou `dispatch()`. Ces règles remplacent chaque correspondance par `[REDACTED]` avant tout récepteur d’observation hérité ou local, journaux et callbacks historiques compris. Un hub partagé peut recevoir la politique via `createObservationHub({ redact })`.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
const task = defineTask({
  key: "record",
  perform(context) {
    context.observation?.emit("sandbox", {
      kind: "command-output",
      channel: "stdout",
      text: "sk-exampleSecret123456789012345",
    });
  },
});
await defineWorkflow("private", [task]).start({
  redact: [/sk-[A-Za-z0-9]{20,}/g],
});
```

Les transcripts du harness, transcripts JSONL CLI et fichiers annexes utilisent ces règles. Les bundles Copilot et Kimi masquent leur contenu décodé avant archivage par transport. Les entrées binaires sont refusées lorsque le masquage est activé. Le masquage agit sur chaque chaîne complète, sans recomposer les frontières d’événements diffusés ; choisissez les expressions adaptées aux identifiants et évitez de les émettre en fragments. Il ne déduit pas les clés inconnues et ne décode pas les encodages arbitraires.

Les prompts envoyés à l’agent et les valeurs retournées gardent leur contenu original. La reprise lit le transcript masqué : les valeurs cachées et les données de raisonnement signées peuvent ne plus être rejouables. La politique couvre les observations Outpost et captures de conversation prises en charge ; elle ne réécrit pas les fichiers natifs de la CLI dans la sandbox, le staging temporaire de transfert, les anciennes archives, fichiers du dépôt, checkpoints ou journaux de votre application. Préférez un home privé éphémère et évitez les identifiants dans les prompts.

API : [ObservationHubOptions](../../reference/observationhuboptions/) · [DispatchOptions](../../reference/dispatchoptions/) · [WorkflowOptions](../../reference/workflowoptions/).
