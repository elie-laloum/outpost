---
title: "Donner des outils au modèle"
description: "Choisissez les outils de la sandbox ou définissez vos propres outils pour le harness intégré."
---

Partez d’un [harness fonctionnel](../harness/). Donnez-lui les outils nécessaires, puis ajoutez un outil personnalisé si une opération manque. Les effets sur les fichiers et commandes doivent passer par la sandbox fournie à l’outil.

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
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { reviewer } from "./reviewer.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "Review the last commit and report risky changes." },
});
console.log(result.text);
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

<span id="définir-un-outil"></span>
<span id="regrouper-des-outils"></span>

Pour cette étape, suivez [Créer un outil pour votre agent](../custom-harness-tools/).

## Utiliser les outils d’un serveur MCP

Pour exposer les outils d’un serveur existant, déclarez-le avec `createHarness({ mcpServers })`. [Serveurs MCP](../mcp-servers/) détaille la configuration ; ses noms d’outils partagent le même espace de noms.

## Workspaces de fichiers

Listing et recherche sélectionnent Git par défaut pour les appels existants. Choisir explicitement `filesystem` dans un workspace de fichiers ; ces opérations s’exécutent dans la sandbox empruntée, gardent permissions et limites, ne suivent pas les liens et n’appliquent pas `.gitignore`. Voir [les workspaces de fichiers](../workspaces/).

## Limites

- `execute` s’exécute dans le processus Outpost, sur l’hôte. Passez par `context.sandbox` pour les fichiers et les commandes ; des API hôte comme `node:fs` contourneraient la sandbox.
- `readOnly` guide l’ordonnancement, il n’impose rien. Un outil marqué en lecture seule peut quand même écrire si son code le fait.
- Un résultat de plus de 100 000 caractères est tronqué avant d’atteindre le modèle.

API : [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/) · [ToolOutput](../../reference/tooloutput/) · [ToolResources](../../reference/toolresources/) · [createHarnessFileTools](../../reference/createharnessfiletools/) · [createHarnessSearchTools](../../reference/createharnesssearchtools/) · [createHarnessGitTools](../../reference/createharnessgittools/) · [createHarnessEditTools](../../reference/createharnessedittools/) · [createHarnessShellTools](../../reference/createharnessshelltools/).
