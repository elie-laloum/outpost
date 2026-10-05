---
title: "Déléguer à des sous-agents"
description: "Donnez au harness intégré des sous-agents aux limites explicites qui partagent sa sandbox."
---

## Déclarer un sous-agent comme outil

Déclarez un sous-agent avec `defineHarnessSubagent()` et exposez-le comme outil du harness parent. Il utilise la sandbox du parent, mais conserve son propre historique de conversation, ses permissions et ses limites.

<!-- tabs -->

```ts title="model.ts"
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
export const model = process.env.MODEL_NAME ?? "";
```

```ts title="reviewer.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
} from "@elie-laloum/outpost";
import { model, modelProvider } from "./model.ts";

export const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "Inspect files and report findings. Do not edit files.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});
```

```ts title="delegation.ts"
import { defineHarnessSubagent } from "@elie-laloum/outpost";
import { reviewer } from "./reviewer.ts";

export const tools = [
  defineHarnessSubagent({
    name: "review",
    description: "Ask a reviewer to inspect repository files.",
    agent: reviewer,
  }),
];
```

```ts title="coordinator.ts"
import { createAgent, createHarness } from "@elie-laloum/outpost";
import { model, modelProvider } from "./model.ts";
import { tools } from "./delegation.ts";

export const coordinator = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools,
    limits: { maxSteps: 8, maxDelegationDepth: 1, usage: { output: 5_000 } },
  }),
});
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { coordinator } from "./coordinator.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator,
  brief: { text: "Have the validation code reviewed, then list the risks." },
});
reportValue(result.text);
// Example output: The reviewer found unchecked input in src/validation.ts.
```

Le coordinateur décide quand appeler `review`. Chaque appel démarre le relecteur avec un historique neuf ; `result.text` contient la réponse finale du coordinateur et `result.usage` inclut les tokens du relecteur.

## Entrées et résultats du sous-agent

<!-- canvas -->

- **Déléguer**: Le modèle parent appelle l’outil sous-agent.
  - Étapes
  - **Envoyer un prompt**: La seule entrée est `{ "prompt": "…" }`.
  - **Démarrer l’enfant**: Son historique contient ses propres instructions et ce prompt, rien du parent.
    - hôte
  - → **Travailler**: puis
- **Travailler**: L’enfant exécute sa propre boucle.
  - Étapes
  - **Utiliser ses outils**: Commandes et modifications s’exécutent dans la sandbox et le worktree du parent.
    - sandbox
  - **Compter ses tokens**: L’usage s’additionne chez l’enfant, le parent et chaque ancêtre.
  - → **Rendre**: puis
- **Rendre**: Le parent lit un résultat d’outil.
  - Étapes
  - **Enregistrer le transcript**: La conversation enfant est capturée, même après un échec.
    - hôte
  - **Répondre au parent**: Un texte JSON avec `text`, la réponse finale de l’enfant, et `conversation` quand l’enfant en conserve une.

Les enfants partagent la sandbox du parent : ils n’allouent aucun fournisseur et n’ouvrent aucun workspace, si bien que le parent voit leurs modifications immédiatement. Les délégations s’exécutent une à une, même quand les autres outils du parent s’exécutent en parallèle.

## Limiter le travail délégué

Chaque boucle garde ses propres compteurs d’étapes et d’appels d’outils, tandis que les budgets de tokens s’additionnent sur les descendants.

Référence API : [HarnessLimits](../../reference/harnesslimits/).

Une erreur d’outil revient au modèle parent, sauf si le parent définit `toolExecution: { onError: "fail" }`. Annuler le dispatch arrête aussi les requêtes modèle et les commandes de l’enfant.

Référence API : [HarnessLimits](../../reference/harnesslimits/) et [HarnessSubagentOptions](../../reference/harnesssubagentoptions/).

## Permissions et hooks

Les [permissions](../harness-permissions/) du parent et celles de l’enfant s’appliquent toutes deux à chaque appel d’outil de l’enfant, y compris aux entrées réécrites par un hook. Les hooks ne s’exécutent que dans le harness qui les déclare : ceux du parent ne voient pas les appels d’outils de l’enfant.

## Reprendre une conversation enfant

Le transcript de l’enfant va dans le [stockage de conversations](../conversations/) de son harness et enregistre `parentConversation` et `parentCallId`. Passez son identifiant `conversation` en `continuation: { id }` à un `dispatch()` dont l’`agent` est l’enfant pour la poursuivre seule.

Reprendre le parent ne relance pas l’enfant : le parent rejoue les résultats d’outils enregistrés. Définissez `conversations: false` sur le harness enfant pour ne conserver aucun transcript enfant.

## Suivre et réorienter les sous-agents

Chaque délégation émet un événement `subagent` quand elle démarre, se termine ou échoue. Tous les autres événements de l’enfant, `usage` compris, portent l’identifiant de son exécution dans `subagentId`.

```ts
import { reportValue } from "./reporter.ts";
import type { DispatchOptions } from "@elie-laloum/outpost";

const observe: DispatchOptions["observe"] = (event) => {
  if (event.kind === "subagent")
    reportValue(event.name, event.status, event.id, event.conversation);
  // Example output: review started subagent-1 undefined
};
```

Référence API : [AgentEvent](../../reference/agentevent/).

Pour envoyer une instruction à un enfant en cours d’exécution, passez son `id` comme `subagent` à `steering.send()`. Voir [Réorienter un agent en cours](../steering/).

## Limites

- L’enfant doit être un agent du harness intégré ; `defineHarnessSubagent()` refuse les agents CLI.
- Les budgets de tokens reposent sur l’usage rapporté : une réponse en cours peut dépasser un plafond avant qu’Outpost ne le constate. Ce ne sont pas des plafonds de dépense prépayés.
- Quand vous reprenez un parent dont une délégation a été interrompue, cet appel revient au modèle comme une erreur d’outil. Outpost ne relance pas l’enfant.
- Un enfant ne peut pas libérer la sandbox partagée.

API : [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [AgentEvent](../../reference/agentevent/).
