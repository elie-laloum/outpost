---
title: "Votre première tâche"
description: "Exécuter un agent sur votre dépôt, lire sa réponse, puis le laisser commiter une modification sur une branche séparée."
---

## Écrire un script de revue

Partez du `outpost.config.mts` écrit dans [Installation](../setup/). `dispatch()` exécute une tâche d’agent dans une sandbox neuve. Le brief est son instruction ; la branche nommée tient ses modifications à l’écart de votre checkout.

```ts title="review.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review the README for incorrect setup instructions. Report findings without editing files.",
  },
});
console.log(result.text);
console.log(result.usage);
console.log(result.commits);
```

## L’exécuter et lire le résultat

```sh
node review.mts
```

Le script affiche trois champs quand l’agent a terminé.

| Champ     | Contenu                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `text`    | La réponse de l’agent : ce qu’il a relevé dans le README.                                      |
| `usage`   | Les tokens déclarés, payés selon l’[authentification](../authentication/) du harness.          |
| `commits` | Les nouveaux commits (`oid`, `subject`). Vide ici : le brief ne demandait aucune modification. |

## Demander une modification

Copiez `review.mts` dans `fix.mts`, avec une nouvelle branche et un brief qui demande un commit. Gardez l’original pour [Exécuter en CI](../ci-automation/).

```ts title="fix.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-fix" },
  brief: {
    text: "Fix the README setup command, verify that it works and commit the correction.",
  },
});
console.log(result.text);
console.log(result.commits);
```

Lancez `node fix.mts`, puis relisez la branche. Elle part de votre `HEAD` et reste en place après l’exécution ; changez de nom à chaque tâche.

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

:::note
`result.text` est ce que l’agent affirme. Vérifiez la branche ou lancez vos tests avant de vous y fier.
:::

## Ce qui s’est passé

Outpost a ouvert un worktree sous `.outpost/workspaces/`, exécuté l’agent dans une sandbox, puis fermé la sandbox en gardant la branche. [Fonctionnement d’Outpost](../how-it-works/) détaille ce cycle de vie.

## Étapes suivantes

<!-- path -->

1. [D’une tâche à un workflow](../first-workflow/) : Enchaîner des tâches avec des dépendances.
2. [Réponses typées](../typed-responses/) : Recevoir des données validées plutôt que du texte libre.
3. [Sessions de sandbox](../sandbox-sessions/) : Lancer vos tests avant de fusionner.
4. [Dépôt et branche](../repository-and-branch/) : Travailler dans votre checkout ou fusionner automatiquement.

API : [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
