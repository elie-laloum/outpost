---
title: "Tâches interactives"
description: "Persister une question, libérer le sandbox et reprendre la conversation après une réponse humaine."
---

Disponible depuis la 8.0.0. `defineInteractiveAgentTask()` maintient une tâche de workflow inachevée sur plusieurs tours question/réponse. Une question termine le tour de l’agent, capture sa conversation et renvoie `waiting-input` ; les tâches dépendantes restent bloquées. Un appel ultérieur à `start({ answers })` reprend la conversation, et la prochaine question peut dépendre des réponses précédentes.

Contrairement aux [gates de validation](../review-gates/), les questions sont générées durant l’exécution. Il s’agit d’un dialogue entre tours terminés, pas d’une suspension dans un outil en cours ni d’un terminal interactif.

## Définir le dialogue

Utilisez un agent et un provider configurés selon [Installation](../setup/). Le `createHarness()` Outpost et les presets CLI avec capture portable et reprise utilisent le même protocole de réponse structurée. Codex, Claude Code, Copilot et Kimi sont admis avec capture activée. Antigravity et le stockage ou la capture désactivés sont refusés avant allocation. Les tests d’adaptateurs simulés établissent le protocole, pas la compatibilité réelle de toutes les combinaisons CLI/modèle.

```ts
import {
  defineInteractiveAgentTask,
  createLocalTransport,
  defineWorkflow,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";
import type { Agent, SandboxProvider } from "@elie-laloum/outpost";

function discovery(
  repository: string,
  assistant: Agent,
  sandboxProvider: SandboxProvider,
) {
  const clarify = defineInteractiveAgentTask({
    key: "clarify",
    repository,
    agent: assistant,
    sandboxProvider,
    brief:
      "Define the application with the user, then return its specification.",
    actors: ["owner"],
    maxTurns: 12,
    timeoutMs: 120_000,
  });
  const pipeline = defineWorkflow("discovery", [clarify]);
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({
        directory: `${repository}/.outpost/storage`,
      }),
    }),
    runId: "discovery-42",
    version: "1",
  };
  return { clarify, pipeline, checkpoint };
}
```

Appelez `pipeline.start({ checkpoint })`. Affichez `result.inputRequests` dans votre application ; chaque demande contient `id`, `executionId`, la clé de tâche `key`, `question` et éventuellement `choices`/`allowFreeText`. Le texte libre est autorisé par défaut. Lorsque ce champ vaut false, la réponse doit correspondre exactement à un choix. Plusieurs tâches indépendantes peuvent avoir une question en attente.

Outpost fournit à l’agent un protocole : `<interaction>{"kind":"question","question":"…"}</interaction>` ou `<interaction>{"kind":"completed","output":…}</interaction>`. La sortie finale doit être du JSON sans perte. Une réponse invalide reçoit au plus une demande de réparation dans le même tour. Aucun outil `ask_user` supplémentaire n’est requis.

## Accepter une réponse

Authentifiez le répondant dans votre application, puis transmettez son identifiant d’acteur autorisé. Les noms d’acteurs sont des métadonnées de confiance fournies par l’application ; les réponses n’utilisent pas la vérification des gates signées. Conservez la définition du workflow, l’identifiant de run et la version du checkpoint lors de leur reconstruction dans un autre processus.

```ts
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowInputRequest,
} from "@elie-laloum/outpost";

async function answerQuestion(
  pipeline: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  pending: WorkflowInputRequest,
  authenticatedActor: string,
  answer: string,
) {
  return pipeline.start({
    checkpoint,
    answers: [
      {
        executionId: pending.executionId,
        key: pending.key,
        requestId: pending.id,
        actor: authenticatedActor,
        value: answer,
      },
    ],
  });
}
```

Toutes les réponses sont validées avant application. Les réponses acceptées sont persistées avant le prochain tour. Les identifiants périmés, acteurs non autorisés, mauvaises exécutions, doublons et choix invalides sont refusés. Après perte d’une réponse HTTP, inspectez le dernier checkpoint/résultat avant une nouvelle soumission ; cette API n’est pas un endpoint HTTP idempotent. La propriété du checkpoint protège contre les coordinateurs concurrents et exige une [récupération explicite](../durable-runs/) après crash.

Appeler `start()` sans réponses conserve les questions en attente et ne rappelle pas le modèle. Après une réponse, affichez les nouvelles `inputRequests`. Quand la tâche réussit, `result.value(clarify)` contient `output`, `conversation`, `branch`, `directory` et `turns`, sans sandbox actif ni méthodes de continuation. `unwrap()` lève toujours une erreur pendant l’attente. Dans un workflow mixte, `waiting-input` prévaut sur `paused` ; inspectez les enregistrements des tâches pour retrouver les deux types d’attente. Les échecs et annulations prévalent sur les attentes.

## Propriété, limites et récupération

Chaque tour alloue un sandbox et le ferme avant de publier sa question. Le worktree Git nommé est conservé, y compris les fichiers non commités. Outpost n’intègre, ne pousse ni ne supprime ce workspace à la fin ; relisez et intégrez explicitement, puis nettoyez les ressources conservées devenues inutiles. Les fichiers du home et processus du sandbox ne survivent pas aux tours ; conservez les fichiers de projet nécessaires dans le worktree.

Le dépôt, le worktree conservé et le stockage des conversations capturées doivent rester accessibles au prochain runner. Un checkpoint distant ne rend ni Git ni les transcripts locaux portables. Un worktree absent ou détaché est refusé plutôt que de recommencer silencieusement le dialogue. Les providers distants utilisent les contrats existants de transfert et synchronisation, notamment la protection des modifications hôtes concurrentes ; leur validation réelle reste nécessaire.

`maxTurns` vaut 12 par défaut et inclut le résultat final. Une question au dernier tour autorisé échoue au lieu de créer une attente sans issue. Les tentatives du workflow et l’usage des tokens restent cumulés entre appels ; les réparations de réponse comptent aussi dans l’usage. Les délais de tâche et de workflow s’appliquent aux appels exécutés, pas à leur intervalle. Une annulation arrête un tour actif ; elle ne supprime pas une question déjà persistée. Cette première implémentation n’expose ni expiration des questions ni signature des réponses.

Un crash durant un tour peut laisser des effets dans le workspace ou un service externe. La récupération exige `checkpoint.resume: "retry-incomplete"` pour autoriser le rejeu de ce tour inachevé ; les dépendances terminées sont conservées. Une sortie finale de dialogue déjà enregistrée dans le checkpoint est réutilisée sans nouvel appel au modèle. Cela ne garantit ni des effets d’outils exactement une fois ni la restauration d’une pile JavaScript interrompue. Changez version/identifiant du run lorsque les implémentations ou la configuration des providers changent ; nom/modèle d’agent, brief, dépôt, acteurs et limite de tours participent déjà à la compatibilité.

Pour des opérations personnalisées, `defineTask({ interaction: { identity, actors }, perform })` expose `context.interaction.state`, `.answer`, `.save(state)` et `.suspend(question, state)`. Enregistrez uniquement du JSON sans perte. Le callback recommence à chaque réponse et doit utiliser son état pour éviter de répéter du travail terminé. N’interceptez pas le signal de suspension et ne lancez pas plusieurs suspensions concurrentes. `defineInteractiveAgentTask()` applique cette discipline aux conversations d’agents.

API : [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/).
