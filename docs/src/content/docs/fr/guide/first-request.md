---
title: "Votre première tâche"
description: "Écrivez un script TypeScript, lancez un agent et examinez sa réponse et ses commits."
---

## Créer le script

Créez `review.ts` à côté de la configuration de la page [Installation](../setup/). Ce premier script demande à l’agent de lire le README et de présenter ses observations. `dispatch()` ouvre une nouvelle sandbox, et la branche nommée donne à la tâche sa propre copie du dépôt.

```ts title="review.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review the README for incorrect setup instructions. Report findings without editing files.",
  },
});
reportValue(result.text);
// Example output: The README setup command uses an outdated flag.
reportValue(result.usage);
// Example output: { input: 1200, cached: 0, output: 320 }
reportValue(result.commits);
// Example output: []
```

## Exécuter le script

Le script affiche les observations de l’agent une fois la tâche terminée. Cette demande porte sur une lecture sans modification : aucun nouveau commit n’est donc attendu.

```sh
node review.ts
```

Référence API : [DispatchResult](../../reference/dispatchresult/) et [Usage](../../reference/usage/).

## Demander une modification

Pour demander à l’agent de modifier le dépôt, créez `fix.ts` avec un autre nom de branche et des consignes demandant un commit. Gardez `review.ts` si vous souhaitez réutiliser la demande de lecture dans la [CI](../ci-automation/).

```ts title="fix.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-fix" },
  brief: {
    text: "Fix the README setup command, verify that it works and commit the correction.",
  },
});
reportValue(result.text);
// Example output: Corrected the README setup command and committed it.
reportValue(result.commits);
// Example output: [ { oid: '8f3a21c…', subject: 'Fix README setup command' } ]
```

Lancez `node fix.ts`, puis examinez les commits et les modifications avec les commandes ci-dessous. Une nouvelle branche nommée part de votre `HEAD` et reste disponible après la tâche. Utilisez un nom différent pour chaque tâche indépendante ; une branche qui existe déjà est réutilisée.

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

:::note
La réponse décrit ce que l’agent dit avoir fait. Examinez les modifications et lancez les vérifications nécessaires avant d’accepter le travail.
:::

## Comprendre l’exécution

Outpost a ouvert un worktree sous `.outpost/workspaces/`, exécuté l’agent dans une sandbox, puis fermé la sandbox en gardant la branche. La page [Fonctionnement](../how-it-works/) détaille ce cycle de vie.

## Étapes suivantes

<!-- path -->

1. [D’une tâche à un workflow](../first-workflow/) : Enchaîner des tâches avec des dépendances.
2. [Réponses typées](../typed-responses/) : Recevoir des données validées plutôt que du texte libre.
3. [Sessions de sandbox](../sandbox-sessions/) : Lancer vos tests avant de fusionner.
4. [Dépôt et branche](../workspaces/) : Travailler dans votre checkout ou fusionner automatiquement.

API : [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
