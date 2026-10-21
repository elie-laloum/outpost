---
title: "Intercepter la boucle d’agent"
description: "Utilisez des hooks pour refuser un appel d’outil ou demander une étape supplémentaire."
---

Partez de [Contrôler les permissions des outils](../harness-permissions/) et de sa configuration. Utilisez des hooks pour refuser un appel d’outil ou demander une étape supplémentaire.

## Intercepter les appels avec des hooks

Utilisez des hooks pour ajouter des consignes au démarrage, refuser les appels à `write_file` après l’étape 20 et demander un compte rendu des tests avant que l’agent termine. Passez la liste exportée à `createHarness({ hooks })`.

<!-- tabs -->

```ts title="editing-hooks.ts"
import { defineHarnessHook } from "@elie-laloum/outpost/harness";

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
import { defineHarnessHook } from "@elie-laloum/outpost/harness";

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

## Phases du lifecycle

Vous pouvez aussi intervenir sur le prompt, le modèle, la compaction et les sous-agents. Les [13 phases](../../reference/harnesshookphase/) et leurs [décisions](../../reference/harnesshookdecisions/) sont décrites dans l’API.

Pour ajouter une consigne à chaque requête modèle, ajoutez ce hook à votre liste. Les transformations de réponse via `after-model` conservent l’usage facturé et les permissions ; elles ne modifient pas les deltas déjà diffusés en streaming.

```ts title="model-hook.ts"
import { defineHarnessHook } from "@elie-laloum/outpost/harness";

export const modelHook = defineHarnessHook({
  on: "before-model",
  run: ({ system }) => ({
    system: `${system ?? ""}\nExplain your changes briefly.`,
  }),
});
```

Les callbacks reçoivent des données figées et doivent respecter `signal`. Pour un script, utilisez `command` à la place de `run` : contexte JSON sur stdin, décision JSON ou sortie vide sur stdout. Voir [HarnessHookOptions](../../reference/harnesshookoptions/) pour les délais et les limites.

Pour partager ces hooks, déclarez-les dans [`defineAgentProfile({ hooks })`](../agent-profiles/#partager-les-hooks). Le harness sélectionne sa section du profil avant d’ajouter ses hooks locaux.

## Exécuter l’exemple

Après compilation du package, lancez `node examples/74-lifecycle-hooks/index.ts`. L’[exemple complet](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/74-lifecycle-hooks) vérifie les transformations et l’usage sans compte ni appel payant. Pour Claude, Codex et les autres CLI, consultez les [hooks natifs](../cli-hooks/).
