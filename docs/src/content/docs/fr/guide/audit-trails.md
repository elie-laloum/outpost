---
title: "Journaux et traces"
description: "Lire les événements persistés et instrumenter le runtime."
---

Utilisez les journaux de requête pour conserver les traces d’exécution, les observateurs pour l’affichage en direct et la télémétrie pour l’instrumentation.

```ts
import { dispatch, localTransport, readJournal } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = localTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  console.log(
    await readJournal({ transporter, reference: result.logReference }),
  );
}
```

## Options du journal

`logging: false` désactive le journal. `"stdout"` choisit la sortie standard. Un objet sélectionne un transport et éventuellement `verbose` pour conserver les événements bruts. Le `logReference` renvoyé fixe la révision de l’index ; `readJournal()` vérifie les segments liés et renvoie les événements persistés dans l’ordre.

Un journal ouvert expose son préfixe persisté. `maxEntries` et `maxBytes` bornent les lectures. Journaux et transcriptions peuvent contenir des données privées du dépôt : maîtrisez leur stockage et leur partage.

## Télémétrie

Installez `@opentelemetry/api` et importez l’adaptateur via `@elie-laloum/outpost/opentelemetry`. La `telemetry` du workflow mesure le graphe ; celle du dispatch mesure préparation, exécution de l’agent, synchronisation et nettoyage. Ce sont deux frontières d’instrumentation distinctes.

```ts
import { trace, metrics } from "@opentelemetry/api";
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";

const telemetry = openTelemetry({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
```

Enregistrez votre SDK OpenTelemetry et ses exportateurs avant de créer ces objets, puis passez `telemetry` aux options du workflow ou du dispatch. Sans SDK enregistré, ces objets API n’exportent pas de données.

L’application possède l’arrêt des fournisseurs de traces et métriques. Les erreurs d’instrumentation sont isolées des résultats d’exécution. `createReporter()` permet un reporting personnalisé.

API : [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [DispatchTelemetry](../../reference/dispatchtelemetry/) · [createReporter](../../reference/createreporter/).

## Corréler les traces par le hub

Branchez `telemetry.sink` dans `createObservationHub({ sinks: [telemetry.sink] })`, puis transmettez ce hub par `observation`. Les spans de workflow, tâche, tentative, dispatch et opération sont ainsi liés, en conservant les noms de métriques existants. Utilisez ce branchement une seule fois par instance ; le combiner avec le branchement historique `telemetry` pour le même run compterait deux fois les événements. OpenTelemetry reste une dépendance optionnelle par sous-chemin.

Les journaux de dispatch sont des récepteurs du hub. Ils contiennent les opérations contextualisées de préparation jusqu’au nettoyage et un `dispatch-finished` terminal, y compris lors d’échecs précoces. `logging.verbose` conserve événements bruts, deltas, stderr, raisonnement et sorties d’outils diffusées ; le journal normal exclut ces événements détaillés. Les requêtes/réponses modèle complètes nécessitent en plus `createObservationHub({ verbose: true })` pour être produites. Les erreurs de livraison du journal sont des erreurs d’observation et peuvent laisser un journal incomplet ; consultez `observerErrors` et les diagnostics du hub.
