---
title: "Sous-agents"
description: "Permettre à un agent intégré de déléguer une partie de son tour à un agent enfant, avec ses propres instructions, outils et limites, dans la même sandbox."
---

## Exposer un agent enfant comme outil

`defineHarnessSubagent()` transforme un agent du [harness intégré](../harness/) en outil qu’un autre agent intégré peut appeler. Donnez-lui un `name`, une `description` qui indique au parent quand déléguer, et l’`agent` enfant.

```ts
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
  defineHarnessSubagent,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
const model = process.env.MODEL_NAME ?? "";

const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "Inspect files and report findings. Do not edit files.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});

const coordinator = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [
      defineHarnessSubagent({
        name: "review",
        description: "Ask a reviewer to inspect repository files.",
        agent: reviewer,
      }),
    ],
    limits: { maxSteps: 8, maxDelegationDepth: 1, usage: { output: 5_000 } },
  }),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator,
  brief: { text: "Have the validation code reviewed, then list the risks." },
});
console.log(result.text);
```

Le coordinateur décide quand appeler `review`. Chaque appel démarre le relecteur avec un historique neuf ; `result.text` contient la réponse finale du coordinateur et `result.usage` inclut les tokens du relecteur.

## Ce que le parent envoie et reçoit

<!-- flow -->

1. **Déléguer**: Le modèle parent appelle l’outil sous-agent.
   - **Envoyer un prompt**: La seule entrée est `{ "prompt": "…" }`.
   - **Démarrer l’enfant**: Son historique contient ses propres instructions et ce prompt, rien du parent.
     - hôte
2. **Travailler**: L’enfant exécute sa propre boucle.
   - **Utiliser ses outils**: Commandes et modifications s’exécutent dans la sandbox et le worktree du parent.
     - sandbox
   - **Compter ses tokens**: L’usage s’additionne chez l’enfant, le parent et chaque ancêtre.
3. **Rendre**: Le parent lit un résultat d’outil.
   - **Enregistrer le transcript**: La conversation enfant est capturée, même après un échec.
     - hôte
   - **Répondre au parent**: Un texte JSON avec `text`, la réponse finale de l’enfant, et `conversation` quand l’enfant en conserve une.

Les enfants partagent la sandbox du parent : ils n’allouent aucun provider et n’ouvrent aucun workspace, si bien que le parent voit leurs modifications immédiatement. Les délégations s’exécutent une à une, même quand les autres outils du parent s’exécutent en parallèle.

## Borner la délégation

Chaque boucle garde ses propres compteurs d’étapes et d’appels d’outils, tandis que les budgets de tokens s’additionnent sur les descendants.

| Limite                                                                        | Compte                                         | Quand elle est atteinte                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `maxSteps`, `maxToolCalls`                                                    | Chaque boucle séparément.                      | L’enfant s’arrête ; le parent reçoit une erreur d’outil.        |
| `usage` de l’enfant                                                           | L’enfant et ses propres enfants.               | L’enfant s’arrête ; le parent reçoit une erreur d’outil.        |
| `usage` d’un ancêtre                                                          | Cet ancêtre et tous ses descendants.           | Cet ancêtre échoue avec le code `limit`.                        |
| `maxDelegationDepth`                                                          | Les niveaux d’imbrication sous ce harness.     | L’appel de délégation renvoie une erreur d’outil `limit`.       |
| [`toolExecution.deadlineMs`](../../reference/harnesstoolexecution/) du parent | Une délégation entière ; 5 minutes par défaut. | L’enfant est annulé ; le parent reçoit un dépassement de délai. |

Une erreur d’outil revient au modèle parent, sauf si le parent définit `toolExecution: { onError: "fail" }`. Annuler le dispatch arrête aussi les requêtes modèle et les commandes de l’enfant.

`maxDelegationDepth` vaut 3 par défaut, et 0 désactive la délégation. La valeur propre d’un enfant ne peut que restreindre ce que ses ancêtres autorisent : avec `maxDelegationDepth: 1` ci-dessus, le relecteur ne peut pas déléguer à son tour.

## Permissions et hooks

Les [permissions](../harness-permissions/) du parent et celles de l’enfant s’appliquent toutes deux à chaque appel d’outil de l’enfant, y compris aux entrées réécrites par un hook. Les hooks ne s’exécutent que dans le harness qui les déclare : ceux du parent ne voient pas les appels d’outils de l’enfant.

## Reprendre une conversation enfant

Le transcript de l’enfant va dans le [stockage de conversations](../conversations/) de son harness et enregistre `parentConversation` et `parentCallId`. Passez son identifiant `conversation` en `continuation: { id }` à un `dispatch()` dont l’`agent` est l’enfant pour la poursuivre seule.

Reprendre le parent ne relance pas l’enfant : le parent rejoue les résultats d’outils enregistrés. Définissez `conversations: false` sur le harness enfant pour ne conserver aucun transcript enfant.

## Suivre et réorienter les sous-agents

Chaque délégation émet un événement `subagent` quand elle démarre, se termine ou échoue. Tous les autres événements de l’enfant, `usage` compris, portent l’identifiant de son exécution dans `subagentId`.

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";

const observe: DispatchOptions["observe"] = (event) => {
  if (event.kind === "subagent")
    console.log(event.name, event.status, event.id, event.conversation);
};
```

| Champ          | Contenu                                                      |
| -------------- | ------------------------------------------------------------ |
| `id`           | Cette exécution enfant, unique pour chaque délégation.       |
| `callId`       | L’appel d’outil du parent qui l’a lancée.                    |
| `name`         | Le nom de l’outil sous-agent.                                |
| `status`       | `started`, `finished` ou `failed`.                           |
| `conversation` | L’identifiant de la conversation enfant, s’il en existe une. |

Pour envoyer une instruction à un enfant en cours d’exécution, passez son `id` comme `subagent` à `steering.send()`. Voir [Réorienter un agent en cours](../steering/).

## Limites

- L’enfant doit être un agent du harness intégré ; `defineHarnessSubagent()` refuse les agents CLI.
- Les budgets de tokens reposent sur l’usage rapporté : une réponse en cours peut dépasser un plafond avant qu’Outpost ne le constate. Ce ne sont pas des plafonds de dépense prépayés.
- Quand vous reprenez un parent dont une délégation a été interrompue, cet appel revient au modèle comme une erreur d’outil. Outpost ne relance pas l’enfant.
- Un enfant ne peut pas libérer la sandbox partagée.

API : [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [AgentEvent](../../reference/agentevent/).
