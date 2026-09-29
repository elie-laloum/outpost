---
title: "Politiques des outils"
description: "Autoriser, refuser et intercepter les appels d’outils de la boucle."
---

La boucle intégrée accepte `permissions` et `hooks` sur `createHarness()`. Les permissions fournissent des règles ordonnées ; les hooks fournissent un comportement propre à chaque phase.

```ts
import {
  defineHarnessPermissions,
  defineHarnessHook,
} from "@elie-laloum/outpost";

const permissions = defineHarnessPermissions({
  default: "deny",
  rules: [{ effect: "allow", tools: ["git_status"] }],
});
const hook = defineHarnessHook({
  on: "before-tool",
  run({ call }) {
    if (call.name === "publish")
      return { deny: "Publishing needs an external approval." };
  },
});
```

## Ordre des règles

La première règle correspondante décide. Les règles peuvent cibler outils, chemins de ressources et motifs de commandes. Définissez `default: "deny"` pour une liste d’autorisations explicite. Les permissions s’évaluent avant les hooks `before-tool` et de nouveau après une réécriture de l’entrée.

Les permissions dépendent des ressources déclarées par chaque outil. Elles ne remplacent pas l’isolation de sandbox et ne contraignent pas du code hôte arbitraire dans un outil.

## Phases des hooks

`session-start` peut ajouter des instructions. `before-model` et `after-model` observent requêtes et réponses. `before-tool` peut refuser ou réécrire l’entrée ; `after-tool` peut remplacer le résultat. `stop` peut demander une continuation avec une nouvelle instruction.

Les hooks s’exécutent dans l’ordre déclaré au sein d’une phase. Contrairement aux observateurs de progression, leurs exceptions font échouer le tour. Empêcher un arrêt consomme toujours les limites de boucle ; cela ne rend pas l’exécution illimitée.

API : [defineHarnessPermissions](../../reference/defineharnesspermissions/) · [defineHarnessHook](../../reference/defineharnesshook/).
