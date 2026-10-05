---
title: "Suivre la progression"
description: "Recevez les événements des agents et des workflows pendant leur exécution."
---

Passez `createReporter()` dans l’option `observe` de la tâche pour afficher sa progression dans le terminal. Vous verrez la préparation, l’activité de l’agent et le bilan de l’exécution.

```ts
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
```

Chaque ligne commence par `[API review · pass 1]`. Le reporter affiche les phases, les appels d’outils, le texte de l’agent et les avertissements, puis un résumé : durée, code de sortie et tokens.

Référence API : [ReporterOptions](../../reference/reporteroptions/).

## Traiter les événements vous-même

Passez votre propre fonction comme `observe`. Filtrez sur `kind` avant de lire les autres champs.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe(event) {
    if (event.kind === "tool") reportValue(`tool ${event.name}`);
    // Example output: tool read_file
    if (event.kind === "summary")
      reportValue(`pass ${event.pass}: ${event.tokens.output} output tokens`);
    // Example output: pass 1: 320 output tokens
  },
});
```

Un dispatch peut comprendre plusieurs échanges avec l’agent, par exemple lorsqu’il répare une [réponse typée](../typed-responses/).

Référence API : [AgentObservation](../../reference/agentobservation/).

Le [harness intégré](../harness/) ajoute les événements `step`, `subagent`, `tool-output`, `tool-denied`, `hook`, `compaction` et `model-*`. [AgentObservation](../../reference/agentobservation/) décrit les types d’événements et leurs champs.

Pour des gestionnaires asynchrones associés à chaque type d’événement, construisez la fonction de rappel avec [`createCustomReporter()`](../../reference/createcustomreporter/). Le dispatch attend ses gestionnaires avant de rendre la main.

:::caution
`raw`, `prompt`, les arguments d’outils et les aperçus de résultats peuvent contenir du contenu du dépôt et des secrets lus par l’agent. Ne les envoyez pas vers un journal public.
:::

## Suivre un workflow

`start({ observe })` reçoit les événements du workflow : transitions de tâches, tentatives, reprises, consommation et fin de l’exécution. Les événements d’agent restent attachés à chaque tâche : passez `observe` dans sa requête.

<!-- tabs -->

```ts title="reported-review.ts"
import { defineIsolatedTask, createReporter } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Summarize the public API without changing files." },
    observe: createReporter({ label: "review" }),
  }),
});
```

```ts title="report-workflow.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./reported-review.ts";

export const result = await defineWorkflow("review", [review]).start({
  observe(event) {
    if (event.type === "task") reportValue(event.key, event.status);
    // Example output: review done
  },
});
reportValue(result.status, result.observerErrors);
// Example output: done []
```

Référence API : [WorkflowEvent](../../reference/workflowevent/).

## Traiter les erreurs des observateurs

Une exception dans `observe` est enregistrée dans `result.observerErrors`. Elle n’annule pas la tâche et ne change pas le résultat du workflow. Utilisez un signal d’annulation pour arrêter le travail depuis votre code.

Pour arrêter une exécution, passez un `signal` ([limites et annulation](../limits-and-cancellation/)).

## Tracer toute une exécution

`observe` voit un seul dispatch ou un seul workflow. Pour recevoir au même endroit les événements de workflow, d’agent et d’opération, ou pour exporter des traces, utilisez le [hub d’observation et OpenTelemetry](../observability/). Chaque dispatch enregistre aussi ses événements dans un [journal](../journals/) que vous pouvez relire ensuite.

## Ce que rapporte chaque agent

Tous les agents émettent du texte, des appels d’outils et leurs résultats. Les autres détails dépendent du protocole de leur CLI.

| Agent                          | Identifiants d’appels d’outils              | Raisonnement               | Modifications de fichiers | Aussi                                                                                               |
| ------------------------------ | ------------------------------------------- | -------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| [Claude Code](../claude-code/) | Natifs, `parentCallId` pour les sous-agents | Blocs de réflexion         | Non                       | `message-usage` par message ; `text-delta` avec `createClaudeHarness({ partialMessages: true })`.   |
| [Codex](../codex/)             | Identifiants d’éléments natifs              | Éléments de raisonnement   | `file-change`             | Les outils MCP s’appellent `mcp__<server>__<tool>` ; un code de sortie non nul active `isError`.    |
| [Copilot CLI](../copilot-cli/) | Natifs                                      | Oui                        | Non                       | Les erreurs de session arrivent en `warning`.                                                       |
| [Kimi Code](../kimi-code/)     | Natifs                                      | Oui                        | Non                       | Les nouvelles tentatives d’étape arrivent en `warning`.                                             |
| [Antigravity](../antigravity/) | `<conversation>:<step index>`               | Non                        | Non                       | Le texte arrive par fragments ; un outil sans sortie exposée a un `preview` vide.                   |
| [Harness intégré](../harness/) | Fournis par le fournisseur de modèle        | Quand le modèle le renvoie | Non                       | `text-delta` pendant le streaming du modèle, ainsi que les événements du harness décrits ci-dessus. |

## Limites

- Gardez `observe` rapide. Le travail asynchrone passe par une file limitée, et un récepteur qui prend du retard perd des événements ([règles de livraison](../observability/)).
- Une session de terminal interactive ouverte avec `attach()` ne produit aucun événement.

API : [createReporter](../../reference/createreporter/) · [createCustomReporter](../../reference/createcustomreporter/) · [AgentObservation](../../reference/agentobservation/) · [WorkflowEvent](../../reference/workflowevent/) · [ReporterOptions](../../reference/reporteroptions/).
