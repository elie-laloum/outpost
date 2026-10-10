---
title: "Exporter les traces et les métriques"
description: "Relier un hub d’observation à votre instrumentation OpenTelemetry."
---

Après avoir [regroupé les événements](../observability/), reliez-les à votre outil de télémétrie. Préparez la [configuration de l’agent](../setup/) et un SDK OpenTelemetry doté de l’exportateur adapté. Enregistrez les trois fichiers ci-dessous ensemble, puis lancez `node observe-telemetry.ts` après avoir enregistré le SDK.

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
