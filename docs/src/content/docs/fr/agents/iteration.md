---
title: "Passes et marqueurs de fin"
description: "Passes et marqueurs de fin — Outpost"
sidebar:
  order: 5
---

Fixez un nombre maximal de passes pour laisser un agent itérer jusqu’à l’apparition d’un marqueur de fin.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: { file: ".outpost/brief.md" },
  passes: 5,
  until: ["<outpost>done</outpost>"],
});
console.log(result.completed, result.completion, result.turns.length);
```

`passes` est un entier positif, égal à `1` par défaut. `until` accepte une chaîne ou un tableau. Le marqueur par défaut est `<outpost>done</outpost>` ; `until: []` désactive sa recherche. Indiquez à l’agent le marqueur attendu et les critères de fin.

## Environnement recréé ou réutilisé

Le `dispatch({ passes })` de premier niveau crée une nouvelle sandbox par passe, tout en coordonnant les changements du workspace. Les outils installés et l’état des processus ne survivent pas à sa destruction. `sandbox.dispatch({ passes })` réutilise le même environnement actif. Les deux relisent les briefs en fichier à chaque passe.

Le marqueur termine la boucle. Si le processus continue après l’avoir affiché, `settleMs` laisse un délai de grâce réinitialisé par toute nouvelle sortie. Ce délai est distinct de la limite absolue de commande. Sans marqueur, l’épuisement des passes retourne `completed: false`.

Les réponses structurées et les continuations natives nécessitent `passes: 1`. Utilisez les réparations de réponse pour les sorties invalides et des appels explicites à `resume` pour poursuivre volontairement une conversation. Ne combinez pas ces mécanismes avec une boucle à plusieurs passes.

Pour le silence, les avertissements et les limites absolues, voir [l’annulation](../cancellation/).
