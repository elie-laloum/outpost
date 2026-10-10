---
title: "Votre première tâche"
description: "Lancer une revue du README et examiner la réponse et la branche."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="créer-le-script"></span>
<span id="exécuter-le-script"></span>
<span id="demander-une-modification"></span>
<span id="comprendre-lexécution"></span>
<span id="étapes-suivantes"></span>

## Demander une revue du README

Utilisez la configuration de la page [Installation](../setup/). Le dépôt cible doit contenir un README commité. Enregistrez `review.ts` à côté de `outpost.config.ts` ; le script demande une revue à l’agent sur une branche séparée.

```ts title="review.ts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review the README setup instructions. Report problems or say none were found. Do not edit files.",
  },
});
console.log(result.text);
console.log(result.commits);
// Example output: []
```

## Exécuter et examiner le résultat

Lancez le script depuis son dossier :

```sh
node review.ts
```

À la fin de la tâche, il affiche les observations de l’agent, ou une réponse indiquant qu’aucun problème n’a été trouvé, puis la liste des commits. La demande exclut les modifications : une liste vide est donc attendue. La réponse du modèle peut varier ; la sortie montrée n’est pas un résultat de test fixe.

Cette consigne n’impose pas un accès en lecture seule. Examinez la branche si vous devez vérifier ce point :

```sh
git -C /absolute/path/to/your-repository diff HEAD...outpost/readme-review
git -C /absolute/path/to/your-repository worktree list
```

Le diff ci-dessus compare les commits. Si `worktree list` montre encore un répertoire pour `outpost/readme-review`, inspectez aussi ses fichiers :

```sh
git -C /path/from/worktree-list status --short --untracked-files=all
git -C /path/from/worktree-list diff HEAD
```

`status` révèle les fichiers non suivis ; le second diff montre les modifications suivies, indexées ou non. Lisez les fichiers non suivis avant de conclure que rien n’a changé.

Outpost ferme la sandbox qu’il a ouverte et conserve la branche nommée. Une nouvelle branche part du `HEAD` du dépôt ; un nom existant réutilise le travail précédent. Choisissez un autre nom pour une tâche indépendante. Une copie de travail contenant des changements peut rester disponible pour [inspection et récupération](../recovery/).

## Continuer à partir du résultat

- [Demander une modification](../git-workspaces/) : Garder les changements sur une branche à relire.
- [Exécuter une vérification indépendante](../sandbox-sessions/) : Tester le travail dans la même sandbox.
- [Relier deux tâches](../first-workflow/) : Transmettre la réponse à votre code.
- [Suivre la progression](../progress/) : Afficher l’activité pendant le travail du modèle.

[DispatchResult](../../reference/dispatchresult/) décrit la réponse, les commits et la consommation. La page [Comment Outpost exécute une tâche](../how-it-works/) explique quelles ressources restent après cet appel.
