---
title: "Première requête"
description: "Exécuter une tâche et lire le résultat."
---

`dispatch()` exécute une tâche d’agent et ferme la sandbox qu’il a allouée. Importez la configuration de [Mise en place](../setup/), puis fournissez un brief.

## Exécuter une tâche

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
```

```sh
node review.mts
```

La réponse se trouve dans `result.text`. `result.usage` contient les compteurs de tokens et `result.commits` liste les commits collectés. L’appel utilise le compte ou la facturation API sélectionné sur le harness.

## Autoriser les modifications

Remplacez `brief.text` par une demande précise, par exemple : `Corrige la commande d’installation du README, vérifie-la et crée un commit.` La branche nommée conserve le changement séparément pour sa revue. Outpost collecte les commits ; demander un commit fait toujours partie de la tâche de l’agent.

Choisissez un nouveau nom de branche pour chaque travail indépendant. La [stratégie de branches](../repository-and-branch/) explique comment travailler dans le checkout courant ou intégrer une branche terminée.

## Exploiter le résultat

`text` est la réponse de l’agent, pas un rapport de tests imposé par Outpost. Utilisez une [sortie validée](../typed-responses/) pour les données consommées par votre application, et exécutez les vérifications dans une [session de sandbox](../sandbox-sessions/) pour conditionner l’intégration à leur résultat.

Une opération échouée rejette sa promesse. Le `start()` d’un workflow renvoie un résultat avec un statut : voir [Gestion des erreurs](../error-handling/).

API : [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
