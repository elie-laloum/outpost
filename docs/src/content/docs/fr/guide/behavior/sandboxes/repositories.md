---
title: "Choisir un dépôt"
description: "Séparer la configuration du workflow des dépôts Git ciblés."
sidebar:
  order: 1
---

Le projet de workflow contient le script, le brief, les identifiants et la recette d’image. Le dépôt ciblé contient le code que l’agent modifie. Ils peuvent vivre dans des dossiers séparés, et un workflow peut coordonner plusieurs dépôts.

## Initialiser hors du dépôt ciblé

Utilisez un dépôt Git local existant avec au moins un commit. `--repository` attend un chemin de fichier, pas une URL Git distante ; clonez d’abord le dépôt si nécessaire.

```sh
npx @elie-laloum/outpost init --yes \
  --directory /work/workflow1 \
  --repository /work/backend \
  --install --build
```

Copiez `/work/workflow1/.env.example` vers `/work/workflow1/.env`, configurez les [identifiants de l’agent](../../../agents/environment/), puis lancez :

```sh
node /work/workflow1/run.ts "Implémente le changement d’API, teste et crée un commit"
```

Le dossier du workflow n’a pas besoin de métadonnées Git. `init` y écrit les fichiers ; le dépôt ciblé est ouvert à l’exécution du script. Vous pouvez aussi initialiser dans un dépôt en omettant `--repository`.

## Résoudre les chemins explicitement

| Paramètre                         | Résolution du chemin                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `init --directory`                | Relatif au dossier courant du terminal ; ce dossier est la valeur par défaut.        |
| `init --repository`               | Absolu ou relatif au dossier du script généré ; `.` par défaut.                      |
| `.env` et `brief.md` générés      | Relatifs au script, même s’il est lancé depuis un autre dossier.                     |
| `repository` dans la bibliothèque | Relatif à `process.cwd()` sauf si le chemin est absolu ; `process.cwd()` par défaut. |

Par exemple, `--directory /work/workflow1 --repository ../backend` cible `/work/backend`. Dans un script personnalisé, ancrez le chemin au script et transmettez-le à `dispatch` :

```ts
import { resolve } from "node:path";
import {
  agent as composeAgent,
  claude,
  dispatch,
  reporter,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../backend"),
  agent: composeAgent({ harness: claude.harness({}) }),
  sandboxProvider: dockerSandboxProvider({ image: "outpost:workflow1" }),
  branch: { mode: "named", name: "outpost/api-change" },
  brief: { text: "Implémente le changement d’API, teste et crée un commit." },
  observe: reporter(),
});
console.log(result.branch, result.commits);
```

Cet exemple suppose que l’image est construite et l’authentification de l’agent configurée. En adaptant le script généré, conservez sa configuration `runtime` et le chargement du `.env`. Déclarer une variable `repository` ne suffit pas : transmettez-la dans les options du dispatch. Un `workspace` fourni possède déjà son dépôt ; ne passez pas aussi `repository`.

## Retrouver les changements et les fichiers de récupération

Les politiques de branche s’appliquent au dépôt ciblé :

- `named` conserve les commits sur la branche demandée pour relecture.
- `integrate`, utilisé par le script généré, fusionne dans la branche hôte du dépôt ciblé après un dispatch réussi.
- `current` travaille directement dans le checkout sélectionné.

Les worktrees gérés, les verrous et les logs utilisent le `.outpost` du dépôt ciblé, pas le dossier du workflow. Les worktrees gérés propres sont supprimés à la fermeture réussie ; les dispatches échoués ou annulés conservent leur worktree et joignent les chemins de récupération à l’erreur. Le script généré affiche la progression de l’agent et ces chemins en cas d’annulation. Consultez les [politiques de branche](../../../environment/branches/) et la [récupération](../../../operations/recovery/).

Chaque sandbox possède un seul dépôt. Pour modifier plusieurs dépôts, créez un `isolatedTask` par dépôt et reliez-les avec `after` ; voir les [workflows multi-dépôts](../../workflows/sandbox-tasks/#plusieurs-dépôts). Outpost ne pousse pas automatiquement les commits, et l’échec d’une tâche ultérieure n’annule pas les modifications des dépôts précédents.
