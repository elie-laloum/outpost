---
title: "Boucle de modèle"
description: "Laisser Outpost piloter les requêtes de modèle et les outils."
---

Le moteur intégré et ses contrats publics sont stables en 7.0.0.

`harness()` configure la boucle d’Outpost : demander une réponse au modèle, valider les appels d’outils, les exécuter dans la sandbox empruntée, puis demander l’étape suivante.

```ts
import {
  agent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const coder = agent({
  model: process.env.MODEL_NAME ?? "",
  harness: harness({
    modelProvider: openaiModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    instructions: "Inspect the repository and answer with evidence.",
    tools: [harnessFileTools()],
    limits: { maxSteps: 12, maxToolCalls: 30 },
  }),
});
```

Définissez `MODEL_NAME` avec un modèle disponible sur votre service, puis passez cet agent à une requête avec votre dépôt et fournisseur de sandbox. Le fournisseur de modèle n’alloue pas de sandbox et n’hérite pas d’une connexion de compte CLI.

## Limites et erreurs

`limits` borne les étapes, appels d’outils et consommation observée. Atteindre une borne échoue avec le code `limit`. `toolExecution` contrôle concurrence, délais par appel et renvoi des erreurs au modèle ou échec du tour. Les callbacks d’outils s’exécutent dans le processus Outpost et doivent utiliser la sandbox fournie pour les opérations du dépôt.

La boucle prend en charge les [politiques d’outils](../tool-policies/), la [gestion du contexte](../history-management/), les [skills à la demande](../loadable-skills/) et les [serveurs MCP](../mcp-servers/). Ces réglages configurent la boucle intégrée, pas les mécanismes internes des CLI Codex ou Claude.

API : [harness](../../reference/function-harness/) · [HarnessOptions](../../reference/customharnessoptions/).

## Observer la boucle

Le [hub d’observation](../live-events/) reçoit chargement des instructions/skills, décisions des hooks, sorties d’outils corrélées par `callId`, raisonnement lisible et erreurs modèle. Les fournisseurs peuvent émettre des événements de raisonnement et de reprise ; Outpost ne déduit pas les reprises cachées dans un client HTTP et n’ajoute pas de politique de reprise. Les blocs de rejeu peuvent rester opaques même en l’absence de raisonnement lisible.

Les événements complets `model-request` et `model-response` nécessitent un hub explicitement détaillé. Leur contenu peut inclure une conversation privée ; ils sont exclus du journal normal. `tool-result` conserve son aperçu borné tandis que `tool-output` expose les sorties de commandes à leur arrivée.

## Déléguer à un enfant

`defineHarnessSubagent()` expose un agent intégré comme outil. Composez l’enfant explicitement ; chaque appel démarre un historique neuf contenant le `prompt` fourni et les instructions de l’enfant.

```ts
import {
  agent,
  defineHarnessSubagent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const modelProvider = openaiModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
const model = process.env.MODEL_NAME ?? "";
const reviewer = agent({
  model,
  harness: harness({
    modelProvider,
    instructions:
      "Inspect files and report findings. Do not modify the repository.",
    tools: [harnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});
const coordinator = agent({
  model,
  harness: harness({
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

Les erreurs HTTP conservent les en-têtes `Retry-After` valides pour les [reprises de tâches](../task-scheduling/) explicites.
