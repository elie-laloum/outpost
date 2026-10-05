---
title: "Créer votre propre boucle d’agent"
description: "Utilisez le harness intégré d’Outpost avec un fournisseur de modèle, des outils et des limites explicites."
---

## Choisir la boucle intégrée

Choisissez le harness intégré si vous voulez contrôler vous-même l’API du modèle, les outils et les règles d’exécution de l’agent. La boucle s’exécute dans votre processus Node.js, tandis que ses outils agissent dans la sandbox de la tâche.

|                             | Agent CLI                                   | Harness intégré                                                   |
| --------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Où tourne la boucle         | Dans la sandbox, comme processus de la CLI  | Dans votre processus Node.js                                      |
| Outils                      | Ceux de la CLI                              | Uniquement ceux passés à `tools`                                  |
| Accès au modèle             | Connexion de compte ou clé d’API            | Une clé d’API sur un [fournisseur de modèle](../model-providers/) |
| Image de la sandbox         | Contient la CLI, ou l’installe au démarrage | Aucune CLI d’agent à installer                                    |
| Contrôle                    | Réglages de la CLI                          | Permissions, hooks et limites par appel, et sous-agents           |
| Remontée de la consommation | Dépend de la CLI                            | Après chaque réponse du modèle                                    |

[Choisir un agent](../choose-an-agent/) compare toutes les capacités.

## Lancer une tâche

`createHarness()` configure la boucle ; `createAgent()` l’associe à un modèle. L’agent passe ensuite à `dispatch()` comme n’importe quel autre.

<!-- tabs -->

```ts title="review-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="review-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createHarnessSearchTools,
} from "@elie-laloum/outpost";
import { modelProvider } from "./review-model.ts";

export const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: modelProvider,
    instructions: "Inspect the repository and answer with evidence.",
    tools: [createHarnessFileTools(), createHarnessSearchTools()],
  }),
});
```

```ts title="harness-review.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { reviewer } from "./review-agent.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "List the exported functions that no test calls." },
});
reportValue(result.text);
// Example output: No test calls parseDate() or formatDate().
reportValue(result.usage);
// Example output: { input: 1200, cached: 0, output: 320 }
```

Définissez `ANTHROPIC_API_KEY`, puis lancez `node harness-review.ts`. `result.text` contient la réponse finale du modèle. Ces outils ne font que lire des fichiers : l’agent ne peut pas modifier le dépôt.

## Étapes de la boucle

<!-- canvas -->

- **Ouvrir le tour**: Une fois par brief, passe ou réparation.
  - Étapes
  - **Construire le prompt système**: Résoudre `instructions` et le catalogue de compétences.
    - hôte
  - **Démarrer les serveurs MCP**: Les `mcpServers` déclarés démarrent et ajoutent leurs outils.
    - sandbox
  - → **Exécuter une étape**: puis
- **Exécuter une étape**: Répétée jusqu’à ce que le modèle réponde sans appel d’outil.
  - Étapes
  - **Interroger le modèle**: Envoyer l’historique, le prompt système et la liste des outils.
    - hôte
  - **Contrôler les appels**: Valider chaque entrée contre son schéma, puis appliquer les permissions et les hooks `before-tool`.
    - hôte
  - **Exécuter les outils**: Les appels consécutifs en lecture seule tournent en parallèle, les autres un par un.
    - sandbox
  - **Renvoyer les résultats**: Résultats et erreurs d’outils rejoignent l’historique pour l’étape suivante.
    - hôte
  - → **Terminer**: puis
- **Terminer**: Le modèle répond.
  - Étapes
  - **Rendre la réponse**: Le texte final devient `result.text`, sauf si un hook `stop` ou une nouvelle instruction envoyée pendant l’exécution relance le modèle.
    - hôte

Outpost vérifie les limites avant chaque étape et après chaque réponse du modèle. La première atteinte termine le tour par une [`OutpostError`](../error-handling/).

## Limiter un échange avec le modèle

`limits` borne la boucle ; `toolExecution` règle l’exécution des appels d’outils.

```ts
import {
  createAnthropicModelProvider,
  createHarness,
  createHarnessShellTools,
} from "@elie-laloum/outpost";

const harness = createHarness({
  modelProvider: createAnthropicModelProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  }),
  tools: [createHarnessShellTools()],
  limits: { maxSteps: 30, maxToolCalls: 60, usage: { output: 20_000 } },
  toolExecution: { deadlineMs: 60_000, onError: "fail" },
});
```

Référence API : [HarnessLimits](../../reference/harnesslimits/) et [HarnessToolExecution](../../reference/harnesstoolexecution/).

Avec `onError` par défaut, un appel en échec ou expiré revient au modèle comme résultat d’erreur, et la boucle continue. `usage` compte les sous-agents et les résumés de contexte, et exige un fournisseur de modèle qui remonte une consommation complète.

### Délais du dispatch

`deadlineMs` et `idleMs` de `dispatch()` bornent aussi chaque tour du harness : sa durée totale et le silence entre deux événements de la boucle. Un appel d’outil en cours suspend le délai d’inactivité ; `toolExecution.deadlineMs` le borne à la place. Voir [Limites et annulation](../limits-and-cancellation/).

## Observer la boucle

Référence API : [AgentObservation](../../reference/agentobservation/).

Suivez les appels d’outils et les requêtes au modèle pendant l’exécution du harness. Cet exemple active l’observation détaillée pour que la fonction de rappel puisse examiner la requête complète au modèle.

<!-- tabs -->

```ts title="observed-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const observedModel = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="observed-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
} from "@elie-laloum/outpost";
import { observedModel } from "./observed-model.ts";

export const agent = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: observedModel,
    tools: [createHarnessFileTools()],
  }),
});
```

```ts title="observe-harness.ts"
import { reportValue } from "./reporter.ts";
import { dispatch, createObservationHub } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./observed-agent.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Explain how the build is configured." },
  observation: createObservationHub({ verbose: true }),
  observe(event) {
    if (event.kind === "tool") reportValue(event.name, event.input);
    // Example output: read_file { path: "README.md" }
    if (event.kind === "model-request") console.dir(event.request);
  },
});
```

`tool-output` diffuse la sortie des commandes, rattachée à son appel par `callId`. Les contenus complets de `model-request` et `model-response` n’existent qu’avec un [hub d’observation](../observability/) détaillé. Ils contiennent toute la conversation, et le journal normal les écarte.

## Aller plus loin

<!-- features -->

- [Fournisseurs de modèles](../model-providers/): Brancher une API compatible OpenAI ou Anthropic.
- [Outils](../harness-tools/): Donner au modèle fichiers, recherche, édition, Git, un shell ou vos propres outils.
- [Permissions et hooks](../harness-permissions/): Autoriser, refuser ou réécrire les appels d’outils avant leur exécution.
- [Sous-agents](../subagents/): Déléguer une partie d’un tour à un agent enfant dans la même sandbox.
- [Contexte et compétences](../harness-context/): Contenir l’historique et charger des instructions à la demande.
- [Serveurs MCP](../mcp-servers/): Ajouter les outils de serveurs Model Context Protocol.

## Limites

- L’accès au modèle exige une clé d’API, ou un serveur local sans clé. Les connexions de compte des CLI ne s’appliquent pas.
- Le code des outils s’exécute dans votre processus, avec vos droits. Seul ce qu’il fait via `context.sandbox` s’exécute dans la sandbox.
- Les requêtes au modèle partent de votre processus : les [restrictions réseau](../network-restrictions/) de la sandbox ne s’y appliquent pas.

API : [createHarness](../../reference/createharness/) · [HarnessOptions](../../reference/customharnessoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [HarnessToolExecution](../../reference/harnesstoolexecution/) · [createAgent](../../reference/createagent/) · [createObservationHub](../../reference/createobservationhub/).
