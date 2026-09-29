---
title: "Suivre la progression"
description: "Afficher ce que fait un agent pendant qu’il travaille, ou traiter ses événements dans votre propre code."
---

`createReporter()` affiche la progression de l’agent dans le terminal. Passez-le comme `observe` à un dispatch.

```ts
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
```

Chaque ligne commence par `[API review · pass 1]`. Le reporter affiche les phases, les appels d’outils, le texte de l’agent et les avertissements, puis un résumé : durée, code de sortie et tokens.

| Option    | Effet                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `label`   | Remplace `outpost` dans le préfixe des lignes.                                                          |
| `verbose` | Ajoute les arguments d’outils, les aperçus de résultats, le prompt, le répertoire et les lignes brutes. |
| `quiet`   | N’affiche rien, pas même les échecs.                                                                    |
| `write`   | Reçoit le texte formaté à la place de stdout.                                                           |

## Traiter les événements vous-même

Passez votre propre fonction comme `observe`. Filtrez sur `kind` avant de lire les autres champs.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe(event) {
    if (event.kind === "tool") console.log(`tool ${event.name}`);
    if (event.kind === "summary")
      console.log(`pass ${event.pass}: ${event.tokens.output} output tokens`);
  },
});
```

Chaque événement porte aussi `pass`, le numéro de passe de l’agent à partir de 1, et `at`, un horodatage ISO. Un dispatch enchaîne plusieurs passes quand il répare une [réponse typée](../typed-responses/) ou quand vous fixez `passes`.

| Kind                 | Contient                               | Émis quand                                                                                                          |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `phase`              | `name`, `agent`, `branch`              | Une passe prépare son prompt (`preparing prompt`), puis lance l’agent (`running`).                                  |
| `prompt`             | `text`                                 | Le brief est rendu et sur le point d’être envoyé.                                                                   |
| `conversation`       | `id`                                   | L’agent communique l’identifiant de sa conversation.                                                                |
| `text`, `text-delta` | `text`                                 | L’agent écrit un message, ou un fragment de message en streaming.                                                   |
| `reasoning`          | `text`                                 | L’agent expose un raisonnement lisible.                                                                             |
| `tool`               | `name`, `input`, `callId`              | L’agent appelle un outil.                                                                                           |
| `tool-result`        | `callId`, `name`, `isError`, `preview` | Un appel d’outil se termine. `preview` contient ses 2 000 premiers caractères, `characters` sa longueur.            |
| `file-change`        | `changes`                              | La CLI signale des modifications de fichiers structurées.                                                           |
| `usage`              | `tokens`                               | L’agent communique ses compteurs de tokens.                                                                         |
| `steer`              | `text`, `mode`                         | Une instruction de [pilotage](../steering/) atteint l’agent.                                                        |
| `warning`, `failure` | `message`                              | Outpost ou la CLI signale un problème, ou l’agent signale un tour en échec.                                         |
| `quota`, `fallback`  | `message`, `resetAt`                   | Une [limite d’usage](../quota-pauses/) arrête l’agent, ou un [agent de repli](../fallback-agents/) prend le relais. |
| `stderr`             | `text`, `truncated`                    | La CLI écrit sur stderr, en lignes bornées.                                                                         |
| `stopped`            | `reason`                               | Outpost arrête le processus : `completion`, `idle-timeout`, `deadline`, `aborted`, `oversized-event` ou `steered`.  |
| `result`             | `text`                                 | L’agent rend sa réponse finale.                                                                                     |
| `summary`            | `durationMs`, `status`, `tokens`       | Une passe se termine, avec sa consommation totale.                                                                  |
| `raw`                | `value`                                | La CLI écrit une ligne de protocole, avant qu’Outpost ne la décode.                                                 |

Le [harness intégré](../harness/) ajoute les événements `step`, `subagent`, `tool-output`, `tool-denied`, `hook`, `compaction` et `model-*`. [AgentObservation](../../reference/agentobservation/) liste tous les kinds et leurs champs.

Pour des gestionnaires asynchrones associés à chaque kind, construisez le callback avec [`createCustomReporter()`](../../reference/createcustomreporter/). Le dispatch attend ses gestionnaires avant de rendre la main.

:::caution
`raw`, `prompt`, les arguments d’outils et les aperçus de résultats peuvent contenir du contenu du dépôt et des secrets lus par l’agent. Ne les envoyez pas vers un journal public.
:::

## Suivre un workflow

`start({ observe })` reçoit les événements du workflow : transitions de tâches, tentatives, reprises, consommation et fin de l’exécution. Les événements d’agent restent attachés à chaque tâche : passez `observe` dans sa requête.

```ts
import {
  createReporter,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Summarize the public API without changing files." },
    observe: createReporter({ label: "review" }),
  }),
});
const result = await defineWorkflow("review", [review]).start({
  observe(event) {
    if (event.type === "task") console.log(event.key, event.status);
  },
});
console.log(result.status, result.observerErrors);
```

Chaque événement porte `executionId`, `workflow` et `timestamp` ; les événements de tâche ajoutent `key`.

| Groupe    | `type`                                               | Expliqué dans                                                                                                                    |
| --------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Exécution | `start`, `resume`, `checkpoint`, `finish`            | [Exécutions durables](../durable-runs/)                                                                                          |
| Tâches    | `task`, `attempt`, `retry`, `usage`, `cache`, `loop` | [Reprises](../concurrency-and-retries/), [cache de résultats](../task-cache/), [boucles de vérification](../verification-loops/) |
| Humains   | `gate`, `decision`, `input-request`, `input-answer`  | [Approbations](../approvals/), [tâches interactives](../interactive-tasks/)                                                      |
| Limites   | `quota`, `budget-exceeded`                           | [Pauses de quota](../quota-pauses/), [budgets](../budgets/)                                                                      |

## Quand un observateur lève une exception

Un observateur rend compte ; il ne pilote pas l’exécution. Une exception dans `observe` n’annule ni ne fait échouer le dispatch ou le workflow. Outpost la collecte dans `result.observerErrors`.

Pour arrêter une exécution, passez un `signal` ([limites et annulation](../limits-and-cancellation/)).

## Tracer toute une exécution

`observe` voit un seul dispatch ou un seul workflow. Pour recevoir au même endroit les événements de workflow, d’agent et d’opération, ou pour exporter des traces, utilisez le [hub d’observation et OpenTelemetry](../observability/). Chaque dispatch enregistre aussi ses événements dans un [journal](../journals/) que vous pouvez relire ensuite.

## Ce que rapporte chaque agent

Tous les agents émettent du texte, des appels d’outils et leurs résultats. Les autres détails dépendent du protocole de leur CLI.

| Agent                          | Identifiants d’appels d’outils              | Raisonnement               | Modifications de fichiers | Aussi                                                                                             |
| ------------------------------ | ------------------------------------------- | -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| [Claude Code](../claude-code/) | Natifs, `parentCallId` pour les sous-agents | Blocs de réflexion         | Non                       | `message-usage` par message ; `text-delta` avec `createClaudeHarness({ partialMessages: true })`. |
| [Codex](../codex/)             | Identifiants d’éléments natifs              | Éléments de raisonnement   | `file-change`             | Les outils MCP s’appellent `mcp__<server>__<tool>` ; un code de sortie non nul active `isError`.  |
| [Copilot CLI](../copilot-cli/) | Natifs                                      | Oui                        | Non                       | Les erreurs de session arrivent en `warning`.                                                     |
| [Kimi Code](../kimi-code/)     | Natifs                                      | Oui                        | Non                       | Les nouvelles tentatives d’étape arrivent en `warning`.                                           |
| [Antigravity](../antigravity/) | `<conversation>:<step index>`               | Non                        | Non                       | Le texte arrive par fragments ; un outil sans sortie exposée a un `preview` vide.                 |
| [Harness intégré](../harness/) | Fournis par le provider de modèle           | Quand le modèle le renvoie | Non                       | `text-delta` pendant le streaming du modèle, plus les kinds du harness ci-dessus.                 |

## Limites

- Gardez `observe` rapide. Le travail asynchrone passe par une file bornée, et un récepteur qui prend du retard perd des événements ([règles de livraison](../observability/)).
- Une session de terminal interactive ouverte avec `attach()` ne produit aucun événement.

API : [createReporter](../../reference/createreporter/) · [createCustomReporter](../../reference/createcustomreporter/) · [AgentObservation](../../reference/agentobservation/) · [WorkflowEvent](../../reference/workflowevent/) · [ReporterOptions](../../reference/reporteroptions/).
