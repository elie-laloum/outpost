---
title: "Gérer l’historique de conversation"
description: "Réduire l’historique envoyé au modèle tout en conservant la transcription."
---

## Limiter la taille de l’historique

Choisissez une stratégie de contexte pour réduire l’historique envoyé au modèle lorsque la conversation s’allonge. Outpost peut résumer les anciens messages ou ne garder qu’une partie de l’historique ; la transcription enregistrée reste disponible.

<!-- tabs -->

```ts title="context-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="context-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  summarizeHistory,
} from "@elie-laloum/outpost";
import { modelProvider } from "./context-model.ts";

export const coder = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: modelProvider,
    tools: [createHarnessFileTools()],
    context: summarizeHistory({
      triggerCharacters: 200_000,
      keepRecentMessages: 6,
    }),
  }),
});
```

Dès que l’historique sérialisé dépasse 200 000 caractères, le modèle résume les messages anciens. La requête suivante contient le premier prompt, le résumé et au moins les six messages les plus récents.

## Choisir une stratégie

Choisissez `summarizeHistory()` quand une longue discussion doit garder ses décisions : les anciens messages deviennent un résumé, au prix d’un appel au modèle. Choisissez `truncateToolResults()` quand quelques sorties d’outils occupent l’essentiel de l’historique : leur contenu est raccourci sans produire de résumé. Conservez assez de messages récents pour la tâche en cours.

Référence API : [summarizeHistory](../../reference/summarizehistory/), [truncateToolResults](../../reference/truncatetoolresults/) et [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/).

Le résumé utilise le modèle et le fournisseur de l’agent. Ses tokens comptent dans la consommation du tour et dans le budget `limits.usage` du harness.

## Écrire une stratégie personnalisée

Composez plusieurs stratégies lorsque votre conversation doit combiner réduction des sorties d’outils et résumé. Cet exemple applique les deux traitements dans cet ordre.

Référence API : [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/) et [HarnessContextInput](../../reference/harnesscontextinput/).

```ts
import {
  defineHarnessContextStrategy,
  summarizeHistory,
  truncateToolResults,
} from "@elie-laloum/outpost";

const truncate = truncateToolResults();
const summarize = summarizeHistory();

export const layered = defineHarnessContextStrategy({
  name: "truncate-then-summarize",
  async compact(input) {
    const truncated = await truncate.compact(input);
    const messages = truncated ?? input.messages;
    return (await summarize.compact({ ...input, messages })) ?? truncated;
  },
});
```

La liste renvoyée doit commencer et finir par un message utilisateur, et garder chaque appel d’outil avec son résultat. Outpost la valide et retire les blocs de raisonnement rejoués avant la requête suivante.

## Historique réduit et transcription enregistrée

La réduction de l’historique change ce que le modèle reçoit, pas ce qui est stocké. La transcription garde tous les messages antérieurs et enregistre chaque réduction de l’historique ; [reprendre la conversation](../conversations/) repart de l’historique compacté. Les observateurs reçoivent un événement `compaction` avec le nom de la stratégie et le nombre de messages.

## Limites

- `summarizeHistory()` mesure des caractères sérialisés, pas des tokens. Gardez une marge quand vous dimensionnez `triggerCharacters` d’après la fenêtre du modèle.
- Un résumé incomplet ou vide fait échouer le tour avec le code `response`.
- `conversations: false` cesse de stocker la transcription et désactive la reprise et les réparations de réponse ([Conversations](../conversations/)).

API : [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/) · [defineHarnessSkill](../../reference/defineharnessskill/) · [HarnessOptions](../../reference/customharnessoptions/).

## Pour continuer

- [Charger les instructions et compétences du projet](../harness-skills/)

<span id="écrire-les-instructions-système"></span>
<span id="charger-des-compétences-à-la-demande"></span>
