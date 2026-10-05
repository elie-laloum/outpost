---
title: "Contrôler les permissions des outils"
description: "Autorisez ou refusez les appels d’outils et utilisez des hooks pour intervenir dans la boucle intégrée."
---

Les permissions déterminent quels appels d’outils sont autorisés. Les hooks exécutent votre code à des moments précis de la [boucle intégrée](../harness/). Ces deux réglages appartiennent à `createHarness()`. Pour préparer une sandbox avant un échange, utilisez plutôt les [hooks d’environnement](../environment-setup/).

## N’autoriser que ce dont la tâche a besoin

Le modèle peut lire tous les fichiers sauf les fichiers `.env`, modifier sous `src/` et `test/`, et lancer `npm test`. Tout autre appel renvoie `Denied: <raison>` au modèle comme résultat d’outil en échec, et la boucle continue. Passez `harness` à `createAgent({ harness, model })`.

<!-- tabs -->

```ts title="permission-rules.ts"
export const rules = [
  {
    effect: "deny",
    paths: ["**/.env*"],
    reason: "Environment files are private.",
  },
  { effect: "allow", tools: ["read_file", "list_files"] },
  {
    effect: "allow",
    tools: ["write_file", "edit_file"],
    paths: ["src/**", "test/**"],
  },
  { effect: "allow", tools: ["shell"], commands: ["npm test"] },
] as const;
```

```ts title="permissions.ts"
import { defineHarnessPermissions } from "@elie-laloum/outpost";
import { rules } from "./permission-rules.ts";

export const permissions = defineHarnessPermissions({ default: "deny", rules });
```

```ts title="permission-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="harness.ts"
import {
  createHarness,
  createHarnessFileTools,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { modelProvider } from "./permission-model.ts";
import { permissions } from "./permissions.ts";

export const harness = createHarness({
  modelProvider,
  tools: [
    createHarnessFileTools(),
    createHarnessEditTools(),
    createHarnessShellTools(),
  ],
  permissions,
});
```

## Écrire les règles

Chaque règle a un `effect` (`"allow"` ou `"deny"`) et une ou plusieurs conditions. Une règle s’applique quand toutes ses conditions correspondent.

Référence API : [HarnessPermissionRule](../../reference/harnesspermissionrule/).

La première règle qui s’applique décide. Sans correspondance, `default` s’applique ; il vaut `"allow"` s’il est omis. Une règle d’autorisation avec `paths` exige que tous les chemins de l’appel correspondent ; une règle de refus n’en exige qu’un.

`paths` et `commands` ne ciblent que les outils qui les déclarent. Les outils intégrés de fichiers, d’édition et de recherche déclarent leurs chemins ; `shell` et `git` déclarent leur commande. Pour vos propres outils, déclarez `resources(input)` (voir [Outils](../harness-tools/)).

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

<!-- canvas -->

- **Contrôle**: Avant l’exécution de l’outil.
  - Étapes
  - **Validation**: L’entrée doit respecter le schéma de l’outil.
  - **Évaluation des permissions**: Un refus termine l’appel ; les hooks ne s’exécutent pas.
    - `permissions`
  - **Hooks before-tool**: Dans l’ordre de déclaration. Un `deny` arrête la chaîne ; un `input` passe au hook suivant.
    - `before-tool`
  - **Nouveau contrôle après réécriture**: Outpost valide la nouvelle entrée et réévalue les permissions.
    - `permissions`
  - → **Exécution**: puis
- **Exécution**: L’outil s’exécute dans la sandbox.
  - Étapes
  - → **Retour**: puis
- **Retour**: Le modèle reçoit le résultat.
  - Étapes
  - **Hooks after-tool**: Aussi pour les appels refusés ou en échec. Chacun peut remplacer le résultat.
    - `after-tool`

Les hooks d’une même phase s’exécutent dans l’ordre de déclaration. Pour `stop`, le premier hook qui renvoie `{ continue }` l’emporte, et l’étape supplémentaire compte dans `limits.maxSteps`.

:::caution
Un hook qui lève une exception, ou renvoie une valeur que sa phase n’accepte pas, fait échouer le tour. Les [observateurs de progression](../progress/) ne peuvent pas changer le résultat ; les hooks, si.
:::

## Appliquer les règles aux sous-agents

Un appel d’un [sous-agent](../subagents/) ne s’exécute que si ses permissions et celles de tous ses ancêtres l’autorisent, y compris après une réécriture par un hook. Les hooks restent attachés au harness qui les déclare : les hooks du parent ne voient pas les appels de l’enfant.

## Limites

- Les règles ne voient que ce qu’un outil déclare dans `resources(input)`. Un outil sans cette déclaration ne peut être ciblé que par son nom.
- `commands: ["npm test*"]` autorise aussi `npm test; rm -rf src`. Listez les lignes de commande exactes.
- Les chemins absolus et ceux qui sortent du dépôt ne correspondent à aucun motif `paths` : les règles de refus sur les chemins ne les interceptent pas. Les outils intégrés refusent ces chemins ; vérifiez-les dans vos propres outils.
- Les règles et les hooks contrôlent quels appels démarrent, pas ce que fait un outil autorisé : `npm test` exécute tout ce que lance le script de test. L’isolation vient de la [sandbox](../choose-a-sandbox/) ; voir [Sécurité](../security/).

API : [defineHarnessPermissions](../../reference/defineharnesspermissions/) · [HarnessPermissionRule](../../reference/harnesspermissionrule/) · [defineHarnessHook](../../reference/defineharnesshook/) · [HarnessHookPhase](../../reference/harnesshookphase/) · [createHarness](../../reference/createharness/).
