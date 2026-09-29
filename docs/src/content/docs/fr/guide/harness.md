---
title: "Harness intégré"
description: "Laisser Outpost piloter les requêtes de modèle et les outils."
---

Le moteur intégré et ses contrats publics sont stables en 7.0.0.

`createHarness()` configure la boucle d’Outpost : demander une réponse au modèle, valider les appels d’outils, les exécuter dans la sandbox empruntée, puis demander l’étape suivante.

```ts
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";

const coder = createAgent({
  model: process.env.MODEL_NAME ?? "",
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    instructions: "Inspect the repository and answer with evidence.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 12, maxToolCalls: 30 },
  }),
});
```

Définissez `MODEL_NAME` avec un modèle disponible sur votre service, puis passez cet agent à une requête avec votre dépôt et fournisseur de sandbox. Le fournisseur de modèle n’alloue pas de sandbox et n’hérite pas d’une connexion de compte CLI.

## Limites et erreurs

`limits` borne les étapes, appels d’outils et consommation observée. Atteindre une borne échoue avec le code `limit`. `toolExecution` contrôle concurrence, délais par appel et renvoi des erreurs au modèle ou échec du tour. Les callbacks d’outils s’exécutent dans le processus Outpost et doivent utiliser la sandbox fournie pour les opérations du dépôt.

La boucle prend en charge les [politiques d’outils](../harness-permissions/), la [gestion du contexte](../harness-context/), les [skills à la demande](../harness-context/) et les [serveurs MCP](../mcp-servers/). Ces réglages configurent la boucle intégrée, pas les mécanismes internes des CLI Codex ou Claude.

API : [createHarness](../../reference/createharness/) · [HarnessOptions](../../reference/customharnessoptions/).

## Observer la boucle

Le [hub d’observation](../progress/) reçoit chargement des instructions/skills, décisions des hooks, sorties d’outils corrélées par `callId`, raisonnement lisible et erreurs modèle. Les fournisseurs peuvent émettre des événements de raisonnement et de reprise ; Outpost ne déduit pas les reprises cachées dans un client HTTP et n’ajoute pas de politique de reprise. Les blocs de rejeu peuvent rester opaques même en l’absence de raisonnement lisible.

Les événements complets `model-request` et `model-response` nécessitent un hub explicitement détaillé. Leur contenu peut inclure une conversation privée ; ils sont exclus du journal normal. `tool-result` conserve son aperçu borné tandis que `tool-output` expose les sorties de commandes à leur arrivée.
