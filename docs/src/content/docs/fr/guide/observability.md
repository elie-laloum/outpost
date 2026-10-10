---
title: "Regrouper les événements d’une exécution"
description: "Observer l’activité des workflows, agents et ressources avec un même hub."
---

Pour une session de terminal, commencez par [Suivre la progression](../progress/). Un hub devient utile pour réunir plusieurs tâches et opérations de ressources sous une même exécution. Enregistrez les fichiers nommés ensemble et lancez `node observe-workflow.ts` avec la [configuration initiale](../setup/).

## Observer une exécution entière

Créez un hub d’observation pour réunir les événements du workflow, des agents et des ressources. Ajoutez les fonctions qui recevront les événements, puis passez le hub dans l’option `observation`. Chaque événement contient son contexte d’exécution.

<!-- tabs -->

```ts title="events.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, event.kind);
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

## Observer les décisions et sélections

Les [évaluations de décision](../decisions/) émettent des résumés de cycle de vie avec la source `decision`. Les harnesses routés émettent des événements d’agent `model-route` indiquant modèle effectif, motif et confiance native facultative. Passez `observation` à `decide()` pour une évaluation directe ; tâches et harnesses propagent les scopes workflow, tâche, passage et sous-agent. Les états et réponses complets exigent un hub verbose. L’usage valide est compté de façon synchrone, indépendamment des livraisons et erreurs des récepteurs.

Un hub diffuse des événements en mémoire ; il ne les conserve pas durablement. Un récepteur lent peut perdre des événements et une erreur d’observation n’arrête pas le workflow. Consultez [la livraison et ses erreurs](../observation-delivery/) avant de compter sur une trace complète.

## Pour continuer

- [Exporter les traces et métriques](../opentelemetry/)
- [Lire une exécution depuis un autre processus](../run-state/)

<span id="exporter-vers-opentelemetry"></span>
<span id="sans-hub"></span>

## Pour aller plus loin

- [Gérer les erreurs de livraison](../observation-delivery/)
- [Masquer les données sensibles](../redacting-secrets/)

<span id="livraison-et-erreurs"></span>
<span id="traiter-une-sortie-trop-volumineuse"></span>
<span id="traiter-les-événements-dagent-de-façon-asynchrone"></span>
<span id="limites"></span>

<span id="masquer-les-secrets-avant-sauvegarde-ou-observation"></span>
