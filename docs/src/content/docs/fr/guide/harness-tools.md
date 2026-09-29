---
title: "Outils"
description: "Donner au harness intégré des outils prêts à l’emploi pour les fichiers, la recherche, l’édition, Git et le shell, ou écrire vos propres outils exécutés dans la sandbox."
---

## Donner des outils prêts à l’emploi au modèle

Passez des ensembles d’outils à `createHarness({ tools })`. Le modèle ne peut appeler que les outils listés : donnez-lui le plus petit ensemble utile à la tâche.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
    tools: [
      createHarnessFileTools(),
      createHarnessSearchTools(),
      createHarnessGitTools(),
    ],
  }),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "Review the last commit and report risky changes." },
});
console.log(result.text);
```

Cet agent de revue lit, recherche et consulte l’historique, mais ne peut modifier aucun fichier. Chaque appel s’exécute dans la sandbox du dispatch, à la racine du dépôt.

## Choisir les ensembles d’outils

| Ensemble                     | Outils                    | Lecture seule | Ce que le modèle peut faire                                                                                                            |
| ---------------------------- | ------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `createHarnessFileTools()`   | `read_file`, `list_files` | Oui           | Lire un fichier UTF-8 aux lignes numérotées (`offset`, `limit`) ; lister les fichiers suivis ou non ignorés par Git, filtrés par glob. |
| `createHarnessSearchTools()` | `search`                  | Oui           | Chercher une expression régulière étendue dans les fichiers (`git grep`), par chemin, glob et casse.                                   |
| `createHarnessGitTools()`    | `git`                     | Oui           | Lancer `git status`, `diff`, `log` ou `show` avec des arguments supplémentaires.                                                       |
| `createHarnessEditTools()`   | `write_file`, `edit_file` | Non           | Créer ou remplacer un fichier ; remplacer un texte exact présent une fois, ou partout avec `replace_all`.                              |
| `createHarnessShellTools()`  | `shell`                   | Non           | Lancer une commande `sh -c` sans entrée et lire son code de sortie et sa sortie.                                                       |

Les chemins sont relatifs à la racine du dépôt et doivent y rester. `createHarnessShellTools({ deadlineMs })` borne chaque commande ; la valeur par défaut est de 120 secondes.

## Définir un outil

`defineHarnessTool()` déclare un nom, une description destinée au modèle, un schéma d’entrée et une fonction `execute(input, context)`. L’entrée est validée avant l’exécution de `execute`.

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
import { z } from "zod";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: z.object({ match: z.string().optional() }),
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  async execute({ match }, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "npm",
      arguments: [
        "test",
        ...(match ? ["--", `--test-name-pattern=${match}`] : []),
      ],
      signal,
    });
    return {
      content: result.stdout + result.stderr,
      isError: result.status !== 0,
    };
  },
});
```

<!-- features -->

- `input` : Un objet JSON Schema, ou un Standard Schema convertible en JSON Schema, comme Zod.
- `execute` : Renvoie une chaîne, ou `{ content, isError }` pour signaler un échec au modèle.
- `context.sandbox` : Lance des commandes (`invoke`) et transfère des fichiers (`upload`, `download`) dans la sandbox empruntée.
- `context.signal` : S’interrompt quand le délai de l’appel expire ou que le dispatch est annulé.
- `readOnly` : Signale un outil qui ne modifie rien : la boucle l’exécute en parallèle d’autres appels en lecture seule et le garde pendant les réparations de réponse.
- `resources(input)` : Renvoie les `paths` ou la `command` qu’un appel touche, pour les [règles de permissions](../harness-permissions/).

Un nom d’outil compte de 1 à 64 lettres, chiffres, `_` ou `-`. Une erreur levée renvoie son message au modèle, sauf si `toolExecution.onError` vaut `"fail"` (voir [Harness intégré](../harness/)).

## Regrouper des outils

`defineHarnessToolset()` réunit des outils et d’autres ensembles sous un même nom, pour les partager entre plusieurs harness.

```ts
import {
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessGitTools,
  createHarnessSearchTools,
  createHarnessShellTools,
  defineHarnessToolset,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});

export const coding = defineHarnessToolset({
  name: "coding",
  tools: [inspect, createHarnessEditTools(), createHarnessShellTools()],
});
```

Chaque nom d’outil doit être unique dans le harness : ses outils, ses ensembles imbriqués et les outils de ses [skills](../harness-context/). Un doublon échoue dès la création du harness.

## Utiliser les outils d’un serveur MCP

Pour exposer les outils d’un serveur existant, déclarez-le avec `createHarness({ mcpServers })`. [Serveurs MCP](../mcp-servers/) détaille la configuration ; ses noms d’outils partagent le même espace de noms.

## Limites

- `execute` s’exécute dans le processus Outpost, sur l’hôte. Passez par `context.sandbox` pour les fichiers et les commandes ; des API hôte comme `node:fs` contourneraient la sandbox.
- `readOnly` guide l’ordonnancement, il n’impose rien. Un outil marqué en lecture seule peut quand même écrire si son code le fait.
- Un résultat de plus de 100 000 caractères est tronqué avant d’atteindre le modèle.

API : [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/) · [ToolOutput](../../reference/tooloutput/) · [ToolResources](../../reference/toolresources/) · [createHarnessFileTools](../../reference/createharnessfiletools/) · [createHarnessSearchTools](../../reference/createharnesssearchtools/) · [createHarnessGitTools](../../reference/createharnessgittools/) · [createHarnessEditTools](../../reference/createharnessedittools/) · [createHarnessShellTools](../../reference/createharnessshelltools/).
