---
title: "Contexte et skills"
description: "Garder un long tour du harness intégré dans la fenêtre de contexte du modèle, écrire ses instructions système et ne charger des consignes spécialisées que lorsque le modèle les demande."
---

## Garder l’historique dans ses limites

Un long tour accumule les sorties d’outils jusqu’à ce qu’une requête ne tienne plus dans la fenêtre de contexte du modèle. Définissez `context` sur `createHarness()` : avant chaque requête au modèle, la stratégie peut réécrire l’historique qu’il reçoit.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  summarizeHistory,
} from "@elie-laloum/outpost";

const coder = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
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

| Stratégie                        | Ce que le modèle garde                                                                                                                     | Options et valeurs par défaut                                   | Coût                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| `truncateToolResults()`          | Tous les messages. Les anciens résultats d’outils sont coupés à `maxCharacters` et signalés comme tronqués ; les récents restent complets. | `keepRecent` : 4 messages de résultats, `maxCharacters` : 2 000 | Aucun. La sortie coupée est perdue pour le modèle. |
| `summarizeHistory()`             | Le premier prompt, un résumé des messages anciens et les messages récents.                                                                 | `triggerCharacters` : 400 000, `keepRecentMessages` : 6         | Une requête supplémentaire au modèle par résumé.   |
| `defineHarnessContextStrategy()` | Ce que renvoie votre fonction `compact`.                                                                                                   | `name`, `compact`                                               | Ce que dépense votre fonction.                     |

Le résumé utilise le modèle et le provider de l’agent. Ses tokens comptent dans la consommation du tour et dans le budget `limits.usage` du harness.

## Écrire une stratégie personnalisée

`defineHarnessContextStrategy()` prend un `name` et une fonction `compact`. `compact` reçoit les `messages`, l’étape `step`, le `model`, le `signal` et un utilitaire `summarize(messages)` ; elle renvoie une nouvelle liste de messages, ou `undefined` pour laisser l’historique inchangé.

`context` accepte une seule stratégie. Celle-ci combine les deux stratégies intégrées :

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

## Compaction et transcription stockée

La compaction change ce que le modèle reçoit, pas ce qui est stocké. La transcription garde tous les messages antérieurs et enregistre chaque compaction ; [reprendre la conversation](../conversations/) repart de l’historique compacté. Les observateurs reçoivent un événement `compaction` avec le nom de la stratégie et le nombre de messages.

## Écrire les instructions système

`instructions` accepte du texte, un résolveur `defineHarnessInstructions()`, ou une liste des deux. Outpost les résout au début de chaque tour et les joint par des lignes vides ; les résultats vides sont ignorés.

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

## Charger des skills à la demande

Un skill regroupe des consignes et des outils que le modèle ne charge que lorsqu’il en a besoin. Ses instructions restent hors du prompt système jusque-là.

```ts
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
console.log(
  review.name,
  review.tools.map((tool) => tool.name),
);
```

<!-- check:run -->

Le script affiche `review [ 'git' ]` : le nom du skill et les outils qu’il débloque. Passez-le avec `createHarness({ skills: [review] })`.

<!-- flow -->

1. **Annoncer** : Les instructions système listent le nom et la description de chaque skill.
2. **Charger** : Le modèle appelle `load_skill` avec le nom d’un skill.
   - **Renvoyer les instructions** : Outpost les résout et les renvoie comme résultat de l’outil.
   - **Débloquer les outils** : Les outils du skill deviennent appelables pour le reste de la conversation.
3. **Utiliser** : Le modèle suit les instructions et appelle les outils du skill.
   - **Avant le chargement** : Un appel à un outil du skill renvoie une erreur qui demande de charger le skill.

`instructions` peut être un résolveur, comme pour le harness ; il s’exécute quand le modèle charge le skill. Les noms de skills utilisent 1 à 64 lettres, chiffres, `_` ou `-` et doivent être uniques ; les outils des skills partagent l’espace de noms des outils du harness ([Outils](../harness-tools/)).

:::caution
Un skill guide le modèle ; il n’impose rien. Pour bloquer un outil, utilisez les [permissions](../harness-permissions/) ; pour exiger une décision avant de continuer, utilisez les [approbations](../approvals/).
:::

## Limites

- `summarizeHistory()` mesure des caractères sérialisés, pas des tokens. Gardez une marge quand vous dimensionnez `triggerCharacters` d’après la fenêtre du modèle.
- Un résumé incomplet ou vide fait échouer le tour avec le code `response`.
- Une compaction qui supprime l’appel à `load_skill` reverrouille les outils du skill jusqu’à ce que le modèle le recharge.
- Les définitions des outils de skills partent avec chaque requête, chargées ou non ; les skills économisent le texte des instructions, pas les schémas d’outils.
- `conversations: false` cesse de stocker la transcription et désactive la reprise et les réparations de réponse ([Conversations](../conversations/)).

API : [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/) · [defineHarnessSkill](../../reference/defineharnessskill/) · [HarnessOptions](../../reference/customharnessoptions/).
