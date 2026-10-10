---
title: "Répéter un brief sur plusieurs passes"
description: "Arrêtez les passes sur un marqueur tout en gardant une vérification indépendante."
---

Partez de [Fixer des délais et annuler une tâche](../limits-and-cancellation/) et de sa configuration. Arrêtez les passes sur un marqueur tout en gardant une vérification indépendante.

## Relancer le brief jusqu’à ce que l’agent le déclare terminé

`passes` renvoie le brief quand une passe se termine sans marqueur de fin. Demandez le marqueur dans le brief : Outpost ne l’ajoute pas.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/flaky-tests" },
  brief: {
    text: "Fix the flaky tests and commit. When every test passes, end your answer with READY_FOR_REVIEW.",
  },
  passes: 3,
  until: "READY_FOR_REVIEW",
});
console.log(result.completed, result.completion);
// Example output: true READY_FOR_REVIEW
```

Chaque passe démarre une nouvelle conversation sur la même branche : elle voit donc les commits précédents. Outpost s’arrête à la première passe dont la réponse contient un marqueur. `until` accepte aussi une liste ; `until: []` désactive la recherche et exécute toutes les passes.

Référence API : [DispatchResult](../../reference/dispatchresult/).

:::caution
Un marqueur est une déclaration de l’agent, pas une preuve. Lancez vos tests avant de vous y fier ; les [boucles de vérification](../verification-loops/) relancent l’agent jusqu’à ce que votre contrôle passe.
:::

Si l’agent écrit son marqueur mais continue de tourner, Outpost l’arrête `settleMs` après sa dernière sortie. Le résultat est conservé et `warn` reçoit un message.
