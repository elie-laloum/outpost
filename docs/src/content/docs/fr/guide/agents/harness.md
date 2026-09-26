---
title: Construire un harness personnalisé (expérimental)
description: Composez un fournisseur de modèles, des outils, des instructions et des limites en un agent piloté par Outpost.
---

:::caution[API non publiée]
Cette API de l’arbre de travail est expérimentale. Utilisez un package construit depuis ce checkout.
:::

`claudeHarness()`, `codexHarness()` et `geminiHarness()` confient toute la tâche à une CLI qui exécute sa propre boucle de modèle et d’outils. `harness()` construit cette boucle dans Outpost. Vous déclarez ce que l’agent peut utiliser, et Outpost pilote le modèle :

- un **fournisseur de modèles**, comme `anthropicModelProvider()` ou `openaiModelProvider()` ;
- des **outils** créés avec `defineHarnessTool()` et regroupés avec `defineHarnessToolset()` ;
- des **instructions**, texte fixe ou résolu au démarrage de la tâche avec `defineHarnessInstructions()` ;
- des **limites** sur les étapes, les appels d’outils et les tokens, et la façon d’exécuter les outils ;
- des **hooks** et des **permissions** qui contrôlent la boucle avec `defineHarnessHook()` et `defineHarnessPermissions()`.

Le résultat s’utilise comme tout autre agent : `agent({ harness, model })`, puis `dispatch()`, un sandbox chaud ou une tâche de workflow.

## Exécuter un harness avec un outil

<details>
<summary>Préparation complète et exemple exécutable</summary>

Utilisez Node.js 24+, npm et Git. Construisez ce checkout avec `npm ci` et `npm run build`. Dans un nouveau dossier, installez ce package local et créez un dépôt contenant un fichier :

```sh
mkdir harness-example
cd harness-example
npm init -y
npm install /absolute/path/to/outpost
git init
echo "# Demo" > README.md
git add README.md
git -c user.name=Example -c user.email=example@example.test commit -m "Initial"
```

L’exemple utilise un fournisseur de modèles scénarisé : il s’exécute hors ligne et sans coût. Il répond comme le ferait un modèle : d’abord un appel d’outil, puis une réponse finale construite à partir du résultat.

Enregistrez **example.mts** :

```ts file=example.mts
import {
  agent,
  defineHarnessInstructions,
  defineHarnessTool,
  dispatch,
  harness,
  type ModelProvider,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const listFiles = defineHarnessTool({
  name: "list_files",
  description: "List the files tracked by Git in the repository.",
  readOnly: true,
  input: { type: "object", properties: {}, additionalProperties: false },
  async execute(_input, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "git",
      arguments: ["ls-files"],
      signal,
    });
    if (result.status !== 0) return { content: result.stderr, isError: true };
    return result.stdout;
  },
});

const scripted: ModelProvider = {
  name: "scripted",
  async request({ messages = [] }) {
    const last = messages.at(-1)?.content[0];
    if (last?.type !== "tool-result")
      return {
        text: "",
        content: [
          { type: "tool-call", id: "call-1", name: "list_files", input: {} },
        ],
        stopReason: "tool-calls",
      };
    const text = `Tracked files: ${last.content.trim()}\n<outpost>done</outpost>`;
    return { text, content: [{ type: "text", text }], stopReason: "end" };
  },
};

const explorer = agent({
  model: "scripted-model",
  harness: harness({
    modelProvider: scripted,
    instructions: defineHarnessInstructions(
      ({ sandbox }) => `Work in ${sandbox.root}. Use tools before answering.`,
    ),
    tools: [listFiles],
    limits: { maxSteps: 5 },
  }),
});

const result = await dispatch({
  repository: import.meta.dirname,
  sandboxProvider: localSandboxProvider(),
  agent: explorer,
  brief: { text: "Which files are tracked?" },
  observe(event) {
    if (event.kind === "tool" || event.kind === "tool-result")
      console.log(event.kind, event.name);
  },
});
console.log(result.text);
```

Lancez `node example.mts`. La commande affiche `tool list_files`, `tool-result list_files`, puis `Tracked files: README.md` suivi du marqueur de fin. `localSandboxProvider()` exécute l’outil sur l’hôte sans isolation ; utilisez un provider de conteneurs pour un travail non fiable.

</details>

## Utiliser un vrai modèle

Remplacez le fournisseur scénarisé par un fournisseur de modèles, et fixez les réglages du modèle sur l’agent. Le fournisseur Anthropic exige `maxOutputTokens` :

```ts
import {
  agent,
  anthropicModelProvider,
  harness,
  type HarnessTool,
} from "@elie-laloum/outpost";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY");
const tools: HarnessTool[] = [];

export const reviewer = agent({
  model: {
    name: "claude-sonnet-5",
    reasoning: "high",
    maxOutputTokens: 16_000,
  },
  harness: harness({
    modelProvider: anthropicModelProvider({ apiKey }),
    instructions: "You review code changes. Run the tests before concluding.",
    tools,
    limits: { maxSteps: 30, usage: { output: 200_000 } },
  }),
});
```

Les appels API sont facturés sur cette clé ; les abonnements CLI ne sont pas utilisés. Le fournisseur tourne dans le processus Outpost : la clé n’entre jamais dans le sandbox. Les appels au modèle ne passent pas par la politique réseau (egress) du sandbox.

## Déclarer des outils

Un outil a un nom unique, une description lue par le modèle, un schéma d’entrée et une fonction `execute`. Décrivez l’entrée avec :

- un **objet JSON Schema**. Outpost le valide avec un sous-ensemble intégré : `type`, `properties`, `required`, `additionalProperties`, `items`, `enum`, `const`, `minLength`, `maxLength`, `minimum`, `maximum`, `minItems`, `maxItems`, `title` et `description`. Les autres mots-clés sont refusés à la définition de l’outil. Annotez vous-même le type d’entrée de `execute`.
- ou un **Standard Schema qui expose un JSON Schema**, comme Zod 4. Son validateur contrôle l’entrée et son convertisseur produit le schéma envoyé au modèle ; le type d’entrée est inféré.

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
import { z } from "zod";

export const readFile = defineHarnessTool({
  name: "read_file",
  description: "Read a UTF-8 file relative to the repository root.",
  readOnly: true,
  input: z.object({ path: z.string().min(1) }),
  async execute({ path }, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "cat",
      arguments: ["--", path],
      signal,
    });
    return result.status === 0
      ? result.stdout
      : { content: result.stderr, isError: true };
  },
});
```

`execute` reçoit l’entrée validée et un contexte avec le `sandbox` emprunté, un `signal`, le `callId`, le `model` de l’agent et `observe()`. Renvoyez du texte, ou `{ content, isError }` pour signaler un échec auquel le modèle peut réagir. `observe()` n’accepte que les événements `text`, `warning` et `raw` ; Outpost émet lui-même les événements de la boucle.

`defineHarnessToolset({ name, tools })` regroupe des outils, y compris d’autres jeux d’outils, pour les partager entre harness. Les noms d’outils doivent rester uniques dans tout le harness. Outpost fournit aussi des [jeux d’outils pour lire, chercher, modifier, lancer des commandes et inspecter Git](../harness-toolsets/).

## Boucle, raisons d’arrêt et limites

Chaque étape correspond à une requête au modèle. Outpost envoie les instructions, la conversation en cours et la liste des outils, puis agit selon la raison d’arrêt :

| Raison d’arrêt | Comportement d’Outpost                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `end`          | Renvoie le texte comme résultat de la passe. Dispatch vérifie ensuite les marqueurs de fin et les réponses structurées. |
| `tool-calls`   | Valide et exécute chaque appel, envoie tous les résultats dans un seul message, puis lance l’étape suivante.            |
| `max-tokens`   | Échoue avec le code `limit`. Les appels d’outils tronqués ne sont jamais exécutés.                                      |
| `refusal`      | Échoue avec le code `response`.                                                                                         |

`limits` borne la boucle : `maxSteps` (100 par défaut), `maxToolCalls` et `usage`, un budget de tokens avec `input`, `cached`, `cacheCreated` ou `output`. Atteindre une limite fait échouer la passe avec une `OutpostError` de code `limit` dont `details.limit` nomme la limite ; ce n’est jamais une réussite. L’usage n’est connu qu’après chaque réponse : le budget est vérifié avant chaque nouvelle requête, et la dernière étape peut le dépasser. Une limite d’usage exige un fournisseur qui rapporte l’usage.

Par défaut, le harness demande au fournisseur de mettre en cache le préfixe de la conversation (`cache: true`). Gardez les instructions et les outils stables pour en profiter.

## Exécution des outils

`toolExecution` règle l’exécution des appels :

- `concurrency` (4 par défaut) : les outils marqués `readOnly` s’exécutent en parallèle jusqu’à ce nombre. Les autres s’exécutent un par un, dans l’ordre des appels. Les résultats reviennent toujours dans l’ordre des appels.
- `deadlineMs` (300 000 par défaut) : délai par appel. Les commandes sandbox de l’appel sont annulées, et l’expiration est renvoyée au modèle comme une erreur.
- `onError` (`"return-to-model"` par défaut) : un outil inconnu, une entrée invalide, une exception ou une expiration deviennent un résultat en erreur que le modèle peut corriger. Utilisez `"fail"` pour faire échouer la passe sur une exception.

Pendant l’exécution d’un outil, le délai d’inactivité du dispatch est suspendu et le délai de l’outil s’applique. Annuler le dispatch annule les outils en cours. Le code des outils tourne dans le processus Outpost : un JavaScript qui ignore `signal` continue détaché après son délai, mais ses appels sandbox suivants sont refusés.

## Contrôler la boucle avec des hooks et des permissions

Les hooks sont du code de contrôle exécuté à un point précis de la boucle. Contrairement aux observateurs du dispatch, ils peuvent modifier ce qui se passe, et une exception levée par un hook fait échouer la passe.

| Phase           | Reçoit                                     | Peut renvoyer                                                  |
| --------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `session-start` | le `prompt` rendu                          | `{ instructions }` ajoutées aux instructions système           |
| `before-model`  | les `messages` sur le point d’être envoyés | rien ; levez une erreur pour arrêter la passe                  |
| `after-model`   | le `result` du modèle                      | rien ; levez une erreur pour arrêter la passe                  |
| `before-tool`   | l’appel validé `call`                      | `{ deny: raison }`, ou `{ input }` pour réécrire les arguments |
| `after-tool`    | l’appel `call` et son `result`             | `{ result }` pour remplacer ce que reçoit le modèle            |
| `stop`          | le texte `text` de la réponse finale       | `{ continue: message }` pour refuser l’arrêt                   |

Chaque hook reçoit aussi le `sandbox` emprunté, le `signal` de la passe, le `model` de l’agent et l’étape `step` en cours. Les hooks d’une même phase s’exécutent dans l’ordre de déclaration. Les hooks `before-tool` traitent les appels un par un, dans l’ordre, avant l’exécution de tout outil de l’étape. Une entrée réécrite est de nouveau validée et contrôlée par les permissions. Un hook `stop` qui refuse sans cesse reste borné par `maxSteps`.

```ts
import {
  defineHarnessHook,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

export const permissions = defineHarnessPermissions({
  default: "deny",
  rules: [
    { effect: "deny", commands: ["git push*"], reason: "Do not publish." },
    { effect: "allow", tools: ["read_*", "list_*"] },
    { effect: "allow", tools: ["write_file"], paths: ["src/**", "test/**"] },
    { effect: "allow", tools: ["shell"], commands: ["npm test", "npm run *"] },
  ],
});

let tested = false;
export const requireTests = [
  defineHarnessHook({
    on: "after-tool",
    run({ call, result }) {
      if (call.name === "shell" && !result.isError) tested = true;
    },
  }),
  defineHarnessHook({
    on: "stop",
    run: () =>
      tested ? undefined : { continue: "Run npm test before you finish." },
  }),
];
```

Passez-les avec `harness({ permissions, hooks: requireTests, ... })`. Les règles de permission sont évaluées en premier ; la première règle qui s’applique décide, sinon `default` s’applique. Les règles comparent les noms d’outils, ainsi que les chemins et la commande qu’un outil déclare via sa fonction `resources(input)`. Une règle `allow` avec `paths` exige que tous les chemins déclarés correspondent ; une règle `deny` n’en exige qu’un. Les chemins hors du dépôt ne correspondent jamais. Un outil sans `resources` n’est comparé que par son nom.

Les instructions disent au modèle quoi faire ; les hooks et les permissions l’imposent. Les permissions ne sont pas une frontière de sécurité : les métacaractères du shell peuvent contourner les motifs de commande, et les liens symboliques les règles de chemins. Exécutez le travail non fiable dans un provider de sandbox isolé.

## Skills

Une skill regroupe des instructions, et éventuellement des outils, que le modèle ne charge que lorsqu’une tâche en a besoin. Les instructions système restent ainsi courtes.

```ts
import { defineHarnessSkill, defineHarnessTool } from "@elie-laloum/outpost";

const applyMigration = defineHarnessTool({
  name: "apply_migration",
  description: "Apply the pending database migration.",
  input: { type: "object", additionalProperties: false },
  execute: async (_input, { sandbox, signal }) =>
    (
      await sandbox.invoke({
        executable: "npm",
        arguments: ["run", "migrate"],
        signal,
      })
    ).stdout,
});

export const migrations = defineHarnessSkill({
  name: "migrations",
  description: "Plan and apply database migrations.",
  instructions:
    "Back up the database, write a reversible migration, then apply it.",
  tools: [applyMigration],
});
```

Passez les skills avec `harness({ skills: [migrations], ... })`. Les instructions système listent alors le nom et la description de chaque skill, et le moteur ajoute un outil `load_skill`. Charger une skill renvoie ses instructions, résolues à ce moment comme avec `defineHarnessInstructions()`, et active ses outils à partir de l’étape suivante.

Les outils des skills sont déclarés au modèle dès le départ pour que la liste d’outils, et donc le cache du fournisseur, reste stable ; en appeler un avant d’avoir chargé sa skill est refusé avec une explication. Les skills chargées sont lues dans la conversation : elles restent chargées après une continuation. Les noms des outils des skills partagent l’espace de noms du harness, et `load_skill` est réservé quand des skills sont présentes.

## Conversations, réparations et contexte

Chaque passe d’un harness personnalisé est enregistrée comme transcription JSONL en ajout seul dans `.outpost/conversations/harness/<id>.jsonl` du dépôt cible, avec des permissions privées. Outpost ajoute ce dossier aux exclusions Git du dépôt. Le résultat du dispatch renvoie l’identifiant `conversation` et le chemin `transcript` : les harness personnalisés prennent en charge les mêmes fonctions de continuation que Claude Code et Codex.

- `continuation: { id }` reprend la conversation : le prompt suivant s’ajoute après tout l’historique, appels et résultats d’outils compris.
- `continuation: { id, fork: true }` démarre une nouvelle conversation à partir d’une copie de l’historique ; l’original reste inchangé.
- Les réparations de `response` réutilisent la conversation. Pendant une passe de réparation, seuls les outils `readOnly` sont proposés.

Une seule passe peut écrire une conversation à la fois ; une reprise concurrente échoue avec le code `conflict`. Si une passe s’est arrêtée après une demande d’outils, la reprise ajoute un résultat en erreur pour chaque appel sans réponse. Passez `conversations: false` pour désactiver l’enregistrement, et donc la continuation et les réparations. Pour conserver les transcriptions hors de l’hôte, passez `conversations: transportConversations("harness", { transporter, namespace })` ; voir [les transports de stockage](../../operations/storage-transports/).

Les longues passes peuvent dépasser le contexte du modèle. Fixez `context` à une stratégie qui réécrit l’historique avant une requête :

```ts
import { summarizeHistory, truncateToolResults } from "@elie-laloum/outpost";

export const shorten = truncateToolResults({
  keepRecent: 4,
  maxCharacters: 2_000,
});
export const summarize = summarizeHistory({
  triggerCharacters: 400_000,
  keepRecentMessages: 6,
});
```

`truncateToolResults()` raccourcit les résultats des anciens appels d’outils et laisse intacts les plus récents. `summarizeHistory()` demande au modèle de résumer la partie ancienne quand l’historique dépasse une taille, conserve le premier prompt et les messages récents, et coûte une requête de plus. `defineHarnessContextStrategy({ name, compact })` permet d’écrire la vôtre ; `compact` reçoit les messages et une aide `summarize()`, et renvoie une nouvelle liste, ou rien pour garder l’historique.

Le moteur valide le nouvel historique, en retire les blocs de raisonnement, valables seulement dans la conversation d’origine, l’enregistre comme entrée `compaction` dans la transcription et émet un événement `compaction`. Réécrire l’historique change le préfixe de la conversation : le cache du fournisseur repart de ce point.

## Observer la boucle

Les observateurs du dispatch reçoivent `step` avant chaque requête au modèle, des fragments `text-delta` pendant la réponse d’un fournisseur en streaming, `tool` avec un `callId` avant chaque appel, `tool-result` avec un aperçu après, `tool-denied` quand les permissions ou un hook refusent un appel, `stop-prevented` quand un hook `stop` refuse la réponse, `compaction` quand une stratégie de contexte réécrit l’historique, `conversation` avec l’identifiant de conversation, `text` pour le texte du modèle et `usage` pour chaque requête. Voir [Observabilité](../observability/) pour les autres événements.

## Pas encore disponible

Le terminal interactif n’est pas pris en charge. Voir la [feuille de route](../../../project/roadmap/#direct-model-harness) pour la validation qui reste à mener avant publication.

[Référence Harness](../../../reference/overview/harness/) · [Fournisseurs de modèles](../../advanced/model-providers/)
