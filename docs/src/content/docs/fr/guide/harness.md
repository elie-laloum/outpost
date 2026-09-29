---
title: "Harness intégré"
description: "Laisser Outpost mener lui-même la boucle de l’agent : il appelle une API de modèle, contrôle chaque appel d’outil et exécute vos outils dans la sandbox."
---

## Quand le choisir

Un agent CLI apporte sa propre boucle et ses outils. Le harness intégré est la boucle d’Outpost : vous choisissez l’API de modèle, les outils et les règles que chaque appel doit respecter.

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

```ts title="harness-review.mts"
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  createHarnessSearchTools,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
    instructions: "Inspect the repository and answer with evidence.",
    tools: [createHarnessFileTools(), createHarnessSearchTools()],
  }),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "List the exported functions that no test calls." },
});
console.log(result.text);
console.log(result.usage);
```

Définissez `ANTHROPIC_API_KEY`, puis lancez `node harness-review.mts`. `result.text` contient la réponse finale du modèle. Ces outils ne font que lire des fichiers : l’agent ne peut pas modifier le dépôt.

## La boucle en bref

<!-- flow -->

1. **Ouvrir le tour**: Une fois par brief, passe ou réparation.
   - **Construire le prompt système**: Résoudre `instructions` et le catalogue de skills.
     - hôte
   - **Démarrer les serveurs MCP**: Les `mcpServers` déclarés démarrent et ajoutent leurs outils.
     - sandbox
2. **Exécuter une étape**: Répétée jusqu’à ce que le modèle réponde sans appel d’outil.
   - **Interroger le modèle**: Envoyer l’historique, le prompt système et la liste des outils.
     - hôte
   - **Contrôler les appels**: Valider chaque entrée contre son schéma, puis appliquer les permissions et les hooks `before-tool`.
     - hôte
   - **Exécuter les outils**: Les appels consécutifs en lecture seule tournent en parallèle, les autres un par un.
     - sandbox
   - **Renvoyer les résultats**: Résultats et erreurs d’outils rejoignent l’historique pour l’étape suivante.
     - hôte
3. **Terminer**: Le modèle répond.
   - **Rendre la réponse**: Le texte final devient `result.text`, sauf si un hook `stop` ou un message de steering relance le modèle.
     - hôte

Outpost vérifie les limites avant chaque étape et après chaque réponse du modèle. La première atteinte termine le tour par une [`OutpostError`](../error-handling/).

## Borner un tour

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

| Option                      | Borne                                                          | Défaut              | Une fois atteinte                                 |
| --------------------------- | -------------------------------------------------------------- | ------------------- | ------------------------------------------------- |
| `limits.maxSteps`           | Requêtes au modèle dans un tour                                | 100                 | Échoue avec le code `limit`                       |
| `limits.maxToolCalls`       | Appels d’outils dans un tour                                   | Aucune              | Échoue avec le code `limit`                       |
| `limits.usage`              | Tokens d’un tour (`input`, `cached`, `cacheCreated`, `output`) | Aucune              | Échoue avec le code `limit`                       |
| `limits.maxDelegationDepth` | Niveaux imbriqués de [sous-agents](../subagents/)              | 3                   | L’appel de délégation échoue comme un outil       |
| `toolExecution.concurrency` | Appels en lecture seule simultanés                             | 4                   | Les appels suivants attendent                     |
| `toolExecution.deadlineMs`  | Un appel d’outil                                               | 5 minutes           | L’appel échoue avec le code `timeout`             |
| `toolExecution.onError`     | Effet d’un appel d’outil en échec                              | `"return-to-model"` | `"fail"` termine le tour avec l’erreur de l’outil |

Avec `onError` par défaut, un appel en échec ou expiré revient au modèle comme résultat d’erreur, et la boucle continue. `usage` compte les sous-agents et les résumés de contexte, et exige un fournisseur de modèle qui remonte une consommation complète.

### Délais du dispatch

`deadlineMs` et `idleMs` de `dispatch()` bornent aussi chaque tour du harness : sa durée totale et le silence entre deux événements de la boucle. Un appel d’outil en cours suspend le délai d’inactivité ; `toolExecution.deadlineMs` le borne à la place. Voir [Limites et annulation](../limits-and-cancellation/).

## Observer la boucle

`observe` reçoit les événements de la boucle : `step`, `tool`, `tool-result`, `tool-output`, `tool-denied`, `hook`, `subagent` et `model-*`. [Suivre la progression](../progress/) détaille chaque type.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  createObservationHub,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const agent = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
    tools: [createHarnessFileTools()],
  }),
});

await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Explain how the build is configured." },
  observation: createObservationHub({ verbose: true }),
  observe(event) {
    if (event.kind === "tool") console.log(event.name, event.input);
    if (event.kind === "model-request") console.dir(event.request);
  },
});
```

`tool-output` diffuse la sortie des commandes, rattachée à son appel par `callId`. Les contenus complets de `model-request` et `model-response` n’existent qu’avec un [hub d’observation](../observability/) détaillé. Ils contiennent toute la conversation, et le journal normal les écarte.

## Aller plus loin

<!-- features -->

- [Fournisseurs de modèles](../model-providers/): Brancher une API compatible OpenAI ou Anthropic.
  - `createOpenAIModelProvider()`
  - `createAnthropicModelProvider()`
- [Outils](../harness-tools/): Donner au modèle fichiers, recherche, édition, Git, un shell ou vos propres outils.
  - `defineHarnessTool()`
  - `createHarnessShellTools()`
- [Permissions et hooks](../harness-permissions/): Autoriser, refuser ou réécrire les appels d’outils avant leur exécution.
  - `defineHarnessPermissions()`
  - `defineHarnessHook()`
- [Sous-agents](../subagents/): Déléguer une partie d’un tour à un agent enfant dans la même sandbox.
  - `defineHarnessSubagent()`
- [Contexte et skills](../harness-context/): Contenir l’historique et charger des instructions à la demande.
  - `defineHarnessContextStrategy()`
  - `defineHarnessSkill()`
- [Serveurs MCP](../mcp-servers/): Ajouter les outils de serveurs Model Context Protocol.
  - `mcpServers`

## Limites

- L’accès au modèle exige une clé d’API, ou un serveur local sans clé. Les connexions de compte des CLI ne s’appliquent pas.
- Le code des outils s’exécute dans votre processus, avec vos droits. Seul ce qu’il fait via `context.sandbox` s’exécute dans la sandbox.
- Les requêtes au modèle partent de votre processus : les [restrictions réseau](../network-restrictions/) de la sandbox ne s’y appliquent pas.

API : [createHarness](../../reference/createharness/) · [HarnessOptions](../../reference/customharnessoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [HarnessToolExecution](../../reference/harnesstoolexecution/) · [createAgent](../../reference/createagent/) · [createObservationHub](../../reference/createobservationhub/).
