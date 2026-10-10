---
title: "Intercepter la boucle d’agent"
description: "Utilisez des hooks pour refuser un appel d’outil ou demander une étape supplémentaire."
---

Partez de [Contrôler les permissions des outils](../harness-permissions/) et de sa configuration. Utilisez des hooks pour refuser un appel d’outil ou demander une étape supplémentaire.

## Intercepter les appels avec des hooks

Utilisez des hooks pour ajouter des consignes au démarrage, refuser les appels à `write_file` après l’étape 20 et demander un compte rendu des tests avant que l’agent termine. Passez la liste exportée à `createHarness({ hooks })`.

<!-- tabs -->

```ts title="editing-hooks.ts"
import { defineHarnessHook } from "@elie-laloum/outpost";

export const startHook = defineHarnessHook({
  on: "session-start",
  run: () => ({ instructions: "Run npm test before you answer." }),
});
export const editHook = defineHarnessHook({
  on: "before-tool",
  run({ call, step }) {
    if (call.name === "write_file" && step > 20)
      return { deny: "Stop editing and summarize your changes." };
  },
});
```

```ts title="completion-hook.ts"
import { defineHarnessHook } from "@elie-laloum/outpost";

export const completionHook = defineHarnessHook({
  on: "stop",
  run({ text }) {
    if (!text.includes("npm test"))
      return { continue: "Run npm test and report its result." };
  },
});
```

```ts title="hooks.ts"
import { startHook, editHook } from "./editing-hooks.ts";
import { completionHook } from "./completion-hook.ts";

export const hooks = [startHook, editHook, completionHook];
```

Passez la liste à `createHarness({ hooks })`. Un hook qui ne renvoie rien laisse la boucle inchangée.

Référence API : [HarnessHookPhase](../../reference/harnesshookphase/), [HarnessHookEvents](../../reference/harnesshookevents/), [HarnessHookDecisions](../../reference/harnesshookdecisions/) et [HarnessHookContext](../../reference/harnesshookcontext/).

## Ordre des contrôles et des hooks

1. **Valider les paramètres et les permissions.** Un refus arrête l’appel avant les hooks préalables.
2. **Exécuter les hooks préalables dans l’ordre.** Un hook peut refuser l’appel ou modifier ses paramètres. Après modification, Outpost valide à nouveau les paramètres et les permissions.
3. **Exécuter l’outil autorisé dans la sandbox.** Aucun hook ne permet de contourner les permissions.
4. **Exécuter les hooks finaux et répondre au modèle.** Ces hooks s’appliquent aussi aux appels refusés ou échoués et peuvent remplacer leur résultat.

Les hooks d’une même phase s’exécutent dans l’ordre de déclaration. Pour `stop`, le premier hook qui renvoie `{ continue }` l’emporte, et l’étape supplémentaire compte dans `limits.maxSteps`.

:::caution
Un hook qui lève une exception, ou renvoie une valeur que sa phase n’accepte pas, fait échouer le tour. Les [observateurs de progression](../progress/) ne peuvent pas changer le résultat ; les hooks, si.
:::
