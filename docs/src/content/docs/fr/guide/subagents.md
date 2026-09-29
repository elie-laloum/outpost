---
title: "Sous-agents"
description: "Déléguer une partie d’un tour à un agent enfant qui partage la sandbox."
---

`defineHarnessSubagent()` expose un agent intégré comme outil. Composez l’enfant explicitement ; chaque appel démarre un historique neuf contenant le `prompt` fourni et les instructions de l’enfant.

```ts
import {
  createAgent,
  defineHarnessSubagent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";

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
    instructions:
      "Inspect files and report findings. Do not modify the repository.",
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
```

Passez `coordinator` à votre dispatch. Le parent appelle `review` avec `{ "prompt": "Inspect the validation code" }` et reçoit un texte JSON contenant `text` et, si activé, `conversation`. Les enfants utilisent la même sandbox et le même système de fichiers ; ils ne créent pas de workspace et n’allouent pas de provider. Les délégations sont séquentielles, même lorsque les outils enfants sont en lecture seule. Les permissions déclaratives du parent et de l’enfant s’appliquent à chaque appel d’outil enfant, y compris après réécriture de l’entrée. Les hooks enfants restent propres à l’enfant. Les callbacks personnalisés restent du code applicatif de confiance.

Les limites d’étapes et d’appels d’outils s’appliquent indépendamment à chaque boucle. Les plafonds de tokens incluent les résumés de modèle et tous les descendants ; l’usage enfant compte une seule fois dans les totaux du dispatch/workflow. Une limite enfant peut renvoyer une erreur d’outil selon `toolExecution.onError` du parent ; dépasser le budget de tokens d’un ancêtre fait échouer cet ancêtre. Ces limites utilisent l’usage rapporté : une réponse en cours peut consommer des tokens avant la détection du dépassement. Ce ne sont pas des plafonds monétaires prépayés.

`maxDelegationDepth` vaut 3 par défaut ; 0 désactive la délégation. Un enfant peut réduire la profondeur restante sans augmenter la limite d’un ancêtre. L’annulation du parent et les délais d’outils atteignent les requêtes modèles et commandes sandbox enfants. Un enfant ne peut pas libérer la sandbox partagée.

Lorsqu’ils sont activés, les transcripts enfants utilisent le stockage de conversation enfant, enregistrent `parentConversation` et `parentCallId` et sont capturés même après échec. La continuation du parent réutilise les résultats d’outils enregistrés ; elle ne reprend ni ne relance automatiquement un enfant. Les appels interrompus restent des erreurs explicites. Utilisez l’identifiant de conversation enfant dans un dispatch explicite pour le reprendre. Les événements de cycle de vie enfant relient un `id` d’exécution unique, le `callId` de délégation et la conversation optionnelle ; les autres événements enfants et leur contexte d’observation portent `subagentId`. Le terminal interactif reste indisponible pour les harness intégrés.

API : [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/).

Les erreurs HTTP conservent les en-têtes `Retry-After` valides pour les [reprises de tâches](../concurrency-and-retries/) explicites.
