---
title: "Donner des outils au modèle"
description: "Choisissez les outils de la sandbox ou définissez vos propres outils pour le harness intégré."
---

## Donner des outils prêts à l’emploi au modèle

Passez les outils ou ensembles d’outils nécessaires au modèle à `createHarness({ tools })`. Le modèle peut appeler uniquement les outils déclarés : commencez par ceux dont la tâche a besoin.

<!-- tabs -->

```ts title="read-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="read-tools.ts"
import {
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const tools = [
  createHarnessFileTools(),
  createHarnessSearchTools(),
  createHarnessGitTools(),
];
```

```ts title="reviewer.ts"
import { createAgent, createHarness } from "@elie-laloum/outpost";
import { modelProvider } from "./read-model.ts";
import { tools } from "./read-tools.ts";

export const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({ modelProvider, tools }),
});
```

```ts title="review.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { reviewer } from "./reviewer.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "Review the last commit and report risky changes." },
});
reportValue(result.text);
// Example output: The last commit accepts unchecked input in src/parser.ts.
```

Cet agent de revue lit, recherche et consulte l’historique, mais ne peut modifier aucun fichier. Chaque appel s’exécute dans la sandbox du dispatch, à la racine du dépôt.

## Choisir les ensembles d’outils

| Ensemble                     | Outils                    | Lecture seule | Ce que le modèle peut faire                                                                          |
| ---------------------------- | ------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `createHarnessFileTools()`   | `read_file`, `list_files` | Oui           | Lire les fichiers UTF-8 et lister les fichiers suivis ou non ignorés par Git.                        |
| `createHarnessSearchTools()` | `search`                  | Oui           | Chercher une expression régulière étendue dans les fichiers (`git grep`), par chemin, glob et casse. |
| `createHarnessGitTools()`    | `git`                     | Oui           | Lancer `git status`, `diff`, `log` ou `show` avec des arguments supplémentaires.                     |
| `createHarnessEditTools()`   | `write_file`, `edit_file` | Non           | Créer des fichiers et remplacer du texte dans les fichiers existants.                                |
| `createHarnessShellTools()`  | `shell`                   | Non           | Lancer une commande `sh -c` sans entrée et lire son code de sortie et sa sortie.                     |

Les chemins restent à l’intérieur du dépôt. Pour configurer les limites des commandes, consultez [createHarnessShellTools](../../reference/createharnessshelltools/).

## Définir un outil

Cet outil propose au modèle de lancer les tests dans la sandbox. Le modèle peut demander tous les tests ou limiter l’exécution à un nom.

<!-- tabs -->

```ts title="test-input.ts"
import { z } from "zod";

export const testInput = z.object({ match: z.string().optional() });
export type TestInput = z.infer<typeof testInput>;
```

```ts title="execute-tests.ts"
import type { TestInput } from "./test-input.ts";
import type { HarnessToolContext } from "@elie-laloum/outpost";

export async function executeTests(
  { match }: TestInput,
  { sandbox, signal }: HarnessToolContext,
) {
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
}
```

```ts title="run-tests.ts"
import { defineHarnessTool } from "@elie-laloum/outpost";
import { testInput } from "./test-input.ts";
import { executeTests } from "./execute-tests.ts";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: testInput,
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  execute: executeTests,
});
```

Référence API : [HarnessToolOptions](../../reference/harnesstooloptions/), [HarnessToolContext](../../reference/harnesstoolcontext/) et [ToolOutput](../../reference/tooloutput/).

Un nom d’outil compte de 1 à 64 lettres, chiffres, `_` ou `-`. Une erreur levée renvoie son message au modèle, sauf si `toolExecution.onError` vaut `"fail"` (voir [Harness intégré](../harness/)).

## Regrouper des outils

`defineHarnessToolset()` réunit des outils et d’autres ensembles sous un même nom, pour les partager entre plusieurs harness.

<!-- tabs -->

```ts title="inspect-tools.ts"
import {
  defineHarnessToolset,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});
```

```ts title="coding-tools.ts"
import {
  defineHarnessToolset,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { inspect } from "./inspect-tools.ts";

export const coding = defineHarnessToolset({
  name: "coding",
  tools: [inspect, createHarnessEditTools(), createHarnessShellTools()],
});
```

Chaque nom d’outil doit être unique dans le harness : ses outils, ses ensembles imbriqués et les outils de ses [compétences](../harness-context/). Un doublon échoue dès la création du harness.

## Utiliser les outils d’un serveur MCP

Pour exposer les outils d’un serveur existant, déclarez-le avec `createHarness({ mcpServers })`. [Serveurs MCP](../mcp-servers/) détaille la configuration ; ses noms d’outils partagent le même espace de noms.

## Limites

- `execute` s’exécute dans le processus Outpost, sur l’hôte. Passez par `context.sandbox` pour les fichiers et les commandes ; des API hôte comme `node:fs` contourneraient la sandbox.
- `readOnly` guide l’ordonnancement, il n’impose rien. Un outil marqué en lecture seule peut quand même écrire si son code le fait.
- Un résultat de plus de 100 000 caractères est tronqué avant d’atteindre le modèle.

API : [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/) · [ToolOutput](../../reference/tooloutput/) · [ToolResources](../../reference/toolresources/) · [createHarnessFileTools](../../reference/createharnessfiletools/) · [createHarnessSearchTools](../../reference/createharnesssearchtools/) · [createHarnessGitTools](../../reference/createharnessgittools/) · [createHarnessEditTools](../../reference/createharnessedittools/) · [createHarnessShellTools](../../reference/createharnessshelltools/).
