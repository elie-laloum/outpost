---
title: Jeux d’outils fournis pour le harness (expérimental)
description: Donnez à un harness personnalisé des outils de dépôt pour lire, chercher, modifier, lancer des commandes et inspecter Git.
---

:::caution[API expérimentale]
Ces jeux d’outils sont expérimentaux depuis la version 5.0.0 et appartiennent au moteur de [harness personnalisé](../harness/). Ils n’ont été testés qu’avec le provider de sandbox local.
:::

Outpost fournit cinq jeux d’outils pour un [harness personnalisé](../harness/). Chacun renvoie un résultat de `defineHarnessToolset()` : vous pouvez les combiner avec vos propres outils et les restreindre avec des [permissions](../harness/#contrôler-la-boucle-avec-des-hooks-et-des-permissions).

| Jeu d’outils           | Outils                    | Requis dans le sandbox | Lecture seule |
| ---------------------- | ------------------------- | ---------------------- | ------------- |
| `harnessFileTools()`   | `read_file`, `list_files` | Git                    | Oui           |
| `harnessEditTools()`   | `write_file`, `edit_file` | —                      | Non           |
| `harnessSearchTools()` | `search`                  | Git                    | Oui           |
| `harnessGitTools()`    | `git`                     | Git                    | Oui           |
| `harnessShellTools()`  | `shell`                   | `sh` POSIX             | Non           |

```ts
import {
  agent,
  anthropicModelProvider,
  defineHarnessPermissions,
  harness,
  harnessEditTools,
  harnessFileTools,
  harnessGitTools,
  harnessSearchTools,
  harnessShellTools,
} from "@elie-laloum/outpost";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY");

export const engineer = agent({
  model: {
    name: "claude-sonnet-5",
    reasoning: "high",
    maxOutputTokens: 16_000,
  },
  harness: harness({
    modelProvider: anthropicModelProvider({ apiKey }),
    instructions: "Read the relevant code before changing it. Run the tests.",
    tools: [
      harnessFileTools(),
      harnessSearchTools(),
      harnessGitTools(),
      harnessEditTools(),
      harnessShellTools({ deadlineMs: 600_000 }),
    ],
    permissions: defineHarnessPermissions({
      rules: [
        { effect: "deny", commands: ["git push*", "rm -rf *"] },
        {
          effect: "allow",
          tools: ["write_file", "edit_file"],
          paths: ["src/**", "test/**"],
        },
        { effect: "deny", tools: ["write_file", "edit_file"] },
      ],
    }),
  }),
});
```

## Rôle de chaque outil

- **`read_file`** `{ path, offset?, limit? }` renvoie les lignes numérotées d’un fichier UTF-8, 2 000 lignes au plus par appel, avec une note quand le fichier en contient davantage. Les fichiers binaires, les fichiers de plus de 4 Mio et les liens symboliques sont refusés.
- **`list_files`** `{ path?, pattern? }` liste les fichiers que Git suit ou n’ignore pas, 1 000 entrées au plus. `pattern` est un glob comme `src/**/*.ts` ; un glob sans barre oblique, comme `*.md`, correspond aux noms de fichiers à toute profondeur.
- **`write_file`** `{ path, content }` crée ou remplace un fichier, en créant les dossiers manquants. Le fichier reçoit les permissions par défaut.
- **`edit_file`** `{ path, old_text, new_text, replace_all? }` remplace un texte exact. `old_text` doit apparaître une seule fois sauf avec `replace_all` : le modèle inclut assez de contexte pour lever toute ambiguïté. Les fins de ligne et les permissions du fichier sont conservées, et la modification est refusée si le fichier a changé entre-temps.
- **`search`** `{ pattern, path?, glob?, ignore_case?, max_results? }` cherche une expression régulière étendue avec `git grep` dans les fichiers suivis et non ignorés, et renvoie des correspondances `chemin:ligne:texte`, 200 au plus.
- **`git`** `{ command, arguments? }` exécute `status`, `diff`, `log` ou `show`. Les options qui écrivent des fichiers ou lancent des programmes externes, comme `--output` ou `--ext-diff`, sont refusées.
- **`shell`** `{ command }` exécute `sh -c` à la racine du dépôt sans entrée et renvoie le statut de sortie, stdout et stderr. Un statut non nul est signalé au modèle comme une erreur. Le délai de la commande vaut deux minutes par défaut ; `toolExecution.deadlineMs` du harness s’applique aussi.

Les chemins sont relatifs à la racine du dépôt. Les chemins absolus et ceux qui sortent du dépôt sont refusés. La sortie des commandes conserve les 200 000 derniers caractères et signale une troncature.

## Circulation des fichiers

Les outils de fichiers téléchargent le fichier du sandbox dans un dossier temporaire privé de l’hôte, y travaillent, puis renvoient le résultat. Ce fonctionnement préserve les données binaires et marche avec tous les providers de sandbox, y compris distants, sans exiger d’outils dans le sandbox. Le listage et la recherche exécutent `git` dans le sandbox, et `shell` exige un shell POSIX : ils sont indisponibles dans un sandbox local sous Windows sans Git ni `sh`.

## Permissions et sécurité

Chaque outil fourni déclare ses ressources : les outils de fichiers déclarent leurs chemins, `shell` et `git` leur ligne de commande. Les règles de permission comparent ces ressources. Elles limitent les erreurs mais ne sont pas une frontière de sécurité : une commande shell peut atteindre n’importe quel chemin, et un lien symbolique du dépôt peut pointer ailleurs. Exécutez le travail non fiable dans un [provider de sandbox](../../environment/providers/overview/) isolé.

[Construire un harness personnalisé](../harness/) · [Référence Harness](../../../reference/overview/harness/)
