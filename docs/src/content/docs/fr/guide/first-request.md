---
title: "Votre première tâche"
description: "Exécuter un agent sur votre dépôt, lire sa réponse, puis le laisser commiter une modification sur une branche séparée."
---

Exécutez un agent sur votre dépôt, lisez sa réponse, puis laissez-le commiter une modification sur une branche séparée. Il vous faut le fichier `outpost.config.mts` de [Mise en place](../setup/), qui définit `coder`, `repository` et `sandboxProvider`.

## Écrire un script de revue

Créez `review.mts` à côté de `outpost.config.mts`. `dispatch()` exécute une tâche d’agent : il alloue une sandbox, lance l’agent sur votre dépôt et ferme la sandbox quand l’agent a terminé.

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

Le brief est l’instruction que vous donnez à l’agent. La branche nommée lui fournit son propre worktree Git : votre checkout reste intact.

## L’exécuter et lire le résultat

```sh
node review.mts
```

Le script affiche trois valeurs quand l’agent a terminé :

- `result.text` est la réponse finale de l’agent : ici, la liste de ce qu’il a relevé dans le README.
- `result.usage` contient les compteurs de tokens déclarés par l’agent (`input`, `cached`, `output`). L’exécution est payée selon l’[authentification](../authentication/) choisie sur le harness : elle est décomptée de votre abonnement avec `"account"` et facturée sur votre clé d’API avec `"usage"`.
- `result.commits` liste les commits créés par l’agent, chacun avec un `oid` et un `subject`. La liste devrait être vide ici, puisque le brief ne demandait aucune modification.

## Demander une modification

Copiez `review.mts` dans `fix.mts`, puis donnez-lui une nouvelle branche et un brief qui demande un commit vérifié. `review.mts` reste inchangé : [Exécuter en CI](../ci-automation/) le réutilise.

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

Lancez `node fix.mts`. Outpost crée `outpost/readme-fix` à partir de votre `HEAD` courant et conserve la branche après l’exécution : la modification vous y attend pour la revue. Inspectez-la avec Git depuis votre checkout :

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

Les commits listés par `git log` correspondent à `result.commits`. Choisissez un nouveau nom de branche pour chaque tâche indépendante.

## Ce qui s’est passé

Outpost a préparé un worktree pour la branche nommée sous `.outpost/workspaces/` dans votre dépôt et alloué une sandbox auprès de votre provider. L’agent a travaillé dans ce worktree, avec le brief pour tâche. À la fin, Outpost a collecté les nouveaux commits, fermé la sandbox et supprimé le worktree propre, en gardant la branche. [Fonctionnement d’Outpost](../how-it-works/) détaille ce cycle de vie.

`result.text` rapporte ce que l’agent dit avoir fait. Pour agir sur des faits plutôt que sur de la prose, vérifiez vous-même le résultat avec les outils ci-dessous.

## Étapes suivantes

- [D’une tâche à un workflow](../first-workflow/) : enchaîner plusieurs tâches avec des dépendances.
- [Réponses typées](../typed-responses/) : recevoir des données validées plutôt que du texte libre.
- [Sessions de sandbox](../sandbox-sessions/) : lancer vos tests dans la sandbox avant de fusionner.
- [Dépôt et branche](../repository-and-branch/) : travailler dans le checkout courant ou fusionner la branche automatiquement.

API : [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
