---
title: "Gérer le contexte et les compétences"
description: "Limitez l’historique envoyé au modèle et chargez les consignes propres à une tâche quand elles sont utiles."
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

## Écrire les instructions système

Référence API : [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) et [HarnessSkillOptions](../../reference/harnessskilloptions/).

Lisez le fichier `AGENTS.md` du projet dans la sandbox empruntée pour construire les instructions système. Cet exemple utilise son contenu si la lecture réussit et renvoie une chaîne vide dans le cas contraire.

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";

export const projectGuidance = defineHarnessInstructions(
  async ({ sandbox, signal }) => {
    const result = await sandbox.invoke({
      executable: "cat",
      arguments: ["AGENTS.md"],
      signal,
    });
    return result.status === 0 ? result.stdout : "";
  },
);
```

Passez `instructions: ["Answer with evidence.", projectGuidance]`. Le résolveur reçoit la `sandbox` empruntée, le `signal`, le `model` et, quand le harness déclare des [serveurs MCP](../mcp-servers/), un accès `mcp` à leurs prompts.

## Charger des compétences à la demande

Une compétence regroupe des consignes et des outils que le modèle ne charge que lorsqu’il en a besoin. Ses instructions restent hors du prompt système jusque-là.

```ts
import { reportValue } from "./reporter.ts";
import {
  createHarnessGitTools,
  defineHarnessSkill,
} from "@elie-laloum/outpost";

export const review = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
reportValue(
  review.name,
  review.tools.map((tool) => tool.name),
);
// Example output: review [ 'git' ]
```

<!-- check:run -->

Le script affiche `review [ 'git' ]` : le nom de la compétence et les outils qu’elle rend disponibles. Ajoutez-la au harness avec `createHarness({ skills: [review] })`.

<!-- canvas -->

- **Annoncer** : Les instructions système listent le nom et la description de chaque compétence.
  - Étapes
  - → **Charger**: puis
- **Charger** : Le modèle appelle `load_skill` avec le nom d’une compétence.
  - Étapes
  - **Renvoyer les instructions** : Outpost les résout et les renvoie comme résultat de l’outil.
  - **Débloquer les outils** : Les outils de la compétence deviennent appelables pour le reste de la conversation.
  - → **Utiliser**: puis
- **Utiliser** : Le modèle suit les instructions et appelle les outils de la compétence.
  - Étapes
  - **Avant le chargement** : Un appel à un outil de la compétence renvoie une erreur qui demande de charger la compétence.

Référence API : [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) et [HarnessSkillOptions](../../reference/harnessskilloptions/).

:::caution
Une compétence donne des consignes au modèle ; elle ne les fait pas respecter par le moteur. Pour bloquer un outil, utilisez les [permissions](../harness-permissions/) ; pour exiger une décision avant de continuer, utilisez les [approbations](../approvals/).
:::

## Limites

- `summarizeHistory()` mesure des caractères sérialisés, pas des tokens. Gardez une marge quand vous dimensionnez `triggerCharacters` d’après la fenêtre du modèle.
- Un résumé incomplet ou vide fait échouer le tour avec le code `response`.
- Une réduction de l’historique qui supprime l’appel à `load_skill` reverrouille les outils de la compétence jusqu’à ce que le modèle la recharge.
- Les définitions des outils sont envoyées à chaque requête, même si leurs compétences ne sont pas encore chargées. Le chargement à la demande réduit le texte des instructions, mais pas les schémas d’outils.
- `conversations: false` cesse de stocker la transcription et désactive la reprise et les réparations de réponse ([Conversations](../conversations/)).

API : [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/) · [defineHarnessSkill](../../reference/defineharnessskill/) · [HarnessOptions](../../reference/customharnessoptions/).
