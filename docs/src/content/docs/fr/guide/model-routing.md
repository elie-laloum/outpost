---
title: "Router le modèle à chaque étape"
description: "Choisir entre les modèles d’un fournisseur avec une décision System One."
---

Connectez d’abord un [fournisseur de modèle](../model-providers/) et un [service de décision](../decisions/). Le routage choisit un candidat de ce fournisseur à chaque étape ; il ne change pas de sandbox et n’authentifie pas d’autres agents CLI.

## Déclarer le routage

Ajoutez `defineHarnessModelRouting()` au harness intégré pour choisir le modèle conversationnel à chaque étape. Les noms des routes doivent correspondre exactement à la question `choice` sélectionnée ; les candidats utilisent tous le `ModelProvider` du harness. Les presets CLI conservent leur modèle configuré.

<!-- tabs -->

```ts title="routing-decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const nextModel = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Choose the model depth for the next step.",
      criteria: { fast: "Routine tools", deep: "Reasoning or repairs" },
    },
  },
});
```

```ts title="router.ts"
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";

export const laya = createSystemOneDecisionProvider({
  baseUrl: "http://127.0.0.1:8000/v1",
  apiKey: false,
});
```

```ts title="routing.ts"
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
import { nextModel } from "./routing-decision.ts";
import { laya } from "./router.ts";

export const routing = defineHarnessModelRouting({
  provider: laya,
  model: "auto",
  decision: nextModel,
  question: "route",
  models: {
    fast: { name: process.env.FAST_MODEL ?? "", maxOutputTokens: 2_000 },
    deep: { name: process.env.DEEP_MODEL ?? "", maxOutputTokens: 8_000 },
  },
  minConfidence: 0.85,
  fallback: "deep",
  onError: "fallback",
});
```

Définissez `FAST_MODEL` et `DEEP_MODEL` avec des noms acceptés par votre service conversationnel. Les réglages `reasoning` et `maxOutputTokens` d’un candidat s’appliquent lorsqu’il est sélectionné ; aucun réglage du modèle précédent n’est repris.

## Composer l’agent

Le harness valide chaque candidat à sa composition, avant toute allocation de sandbox. Le modèle déclaré sur l’agent fournit le modèle initial, notamment pour une compaction précédant la première sélection.

```ts title="routed-agent.ts"
import {
  createAgent,
  createHarness,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";
import { routing } from "./routing.ts";

export const agent = createAgent({
  model: process.env.DEEP_MODEL ?? "",
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    routing,
  }),
});
```

Passez cet agent à votre [dispatch](../first-request/) avec le fournisseur de sandbox configuré. Les clés d’API restent sur l’hôte ; les outils utilisent la sandbox du dispatch. Un sous-agent peut déclarer son propre harness routé, avec son historique séparé et les budgets cumulés de ses ancêtres.

## Fournir un état utile

Le routage est évalué une fois par étape, après compaction et avant `before-model`. L’état par défaut contient les instructions de session, messages visibles, outils disponibles, numéro d’étape et modèle actif. Les blocs de raisonnement opaques sont exclus. Les résultats d’outils et messages de réparation de réponse structurée influencent ainsi la décision suivante.

Les instructions de session sont résolues une seule fois. La compaction utilise le modèle actif avant le nouveau routage. Les hooks et outils reçoivent le modèle sélectionné. La sélection préserve la sandbox, l’historique et les appels d’outils ; les règles existantes du fournisseur filtrent le raisonnement rejouable incompatible.

```ts title="focused-routing.ts"
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
import { routing } from "./routing.ts";

const { kind: _kind, ...options } = routing;
export const focusedRouting = defineHarnessModelRouting({
  ...options,
  state: ({ step, model, messages }) => ({
    step,
    activeModel: model.name,
    recentText: messages
      .slice(-4)
      .flatMap((message) =>
        message.content.flatMap((block) =>
          block.type === "text" ? [block.text] : [],
        ),
      ),
  }),
});
```

La fonction peut être asynchrone et reçoit le signal d’annulation. Outpost ne tronque jamais silencieusement l’état produit. Choisissez une réduction explicite selon les besoins de votre application.

## Choisir la politique de repli

Le seuil de confiance par défaut est `0.85` ; une confiance inférieure sélectionne `fallback`. Avec `onError: "fallback"`, valeur par défaut, les timeouts et indisponibilités explicitement classées sélectionnent aussi le repli. `onError: "fail"` propage ces erreurs.

Les quotas, annulations, configurations incorrectes, réponses invalides et troncatures se propagent toujours. Une décision sans usage, ou une requête indisponible sans reçu d’usage, signale une consommation incomplète ; un budget strict peut arrêter le tour plutôt que continuer avec une consommation inconnue.

## Observer et reprendre

Les observations `decision` résument les requêtes du routeur ; les événements d’agent `model-route` indiquent chaque sélection et son motif. L’état des requêtes et les réponses détaillées exigent une observation verbose. L’usage est compté une fois, indépendamment des récepteurs, et s’ajoute aux budgets du harness, de ses ancêtres et du workflow.

Les transcripts routés utilisent la version 2, avec le format de stockage `harness`. La version 1 reste lisible. Capture, reprise et fork préservent les messages ; l’étape suivante effectue une nouvelle décision sans rejouer les appels terminés. Le replay du journal restitue les sélections et observations de décision enregistrées sans contacter le routeur ; les données détaillées exigent toujours un hub verbose. Voir l’[observabilité](../observability/) et les [conversations](../conversations/).

API : [defineHarnessModelRouting](../../reference/defineharnessmodelrouting/) · [HarnessModelRoutingOptions](../../reference/harnessmodelroutingoptions/).
