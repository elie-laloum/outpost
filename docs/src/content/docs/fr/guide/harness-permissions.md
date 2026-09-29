---
title: "Permissions et hooks"
description: "Autorisez ou refusez les appels d’outils du harness intégré avec des règles ordonnées, et exécutez votre propre code à chaque étape de sa boucle."
---

Les permissions sont des règles déclaratives sur les appels d’outils. Les hooks sont des fonctions exécutées à des points précis de la boucle du [harness intégré](../harness/). Ce sont deux options de `createHarness()` ; pour lancer des commandes pendant la préparation de la sandbox, voir [Préparer l’environnement](../environment-setup/).

## N’autoriser que ce dont la tâche a besoin

```ts
import {
  createAnthropicModelProvider,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

const harness = createHarness({
  modelProvider: createAnthropicModelProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  }),
  tools: [
    createHarnessFileTools(),
    createHarnessEditTools(),
    createHarnessShellTools(),
  ],
  permissions: defineHarnessPermissions({
    default: "deny",
    rules: [
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
    ],
  }),
});
```

Le modèle peut lire tous les fichiers sauf les fichiers `.env`, modifier sous `src/` et `test/`, et lancer `npm test`. Tout autre appel renvoie `Denied: <raison>` au modèle comme résultat d’outil en échec, et la boucle continue. Passez `harness` à `createAgent({ harness, model })`.

## Écrire les règles

Chaque règle a un `effect` (`"allow"` ou `"deny"`) et une ou plusieurs conditions. Une règle s’applique quand toutes ses conditions correspondent.

| Champ      | Compare                                   | Motifs                                                                         |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `tools`    | Le nom de l’outil                         | `*` couvre n’importe quel texte : `read_*`, `mcp__github__*`.                  |
| `paths`    | Les chemins de l’appel, relatifs au dépôt | `*` reste dans un segment, `**/` traverse les dossiers, `?` vaut un caractère. |
| `commands` | La ligne de commande de l’appel           | `*` couvre n’importe quel texte, espaces compris.                              |
| `reason`   | —                                         | Le texte reçu par le modèle quand cette règle refuse.                          |

La première règle qui s’applique décide. Sans correspondance, `default` s’applique ; il vaut `"allow"` s’il est omis. Une règle d’autorisation avec `paths` exige que tous les chemins de l’appel correspondent ; une règle de refus n’en exige qu’un.

`paths` et `commands` ne ciblent que les outils qui les déclarent. Les outils intégrés de fichiers, d’édition et de recherche déclarent leurs chemins ; `shell` et `git` déclarent leur commande. Pour vos propres outils, déclarez `resources(input)` (voir [Outils](../harness-tools/)).

## Intercepter les appels avec des hooks

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";

const hooks = [
  defineHarnessHook({
    on: "session-start",
    run: () => ({ instructions: "Run npm test before you answer." }),
  }),
  defineHarnessHook({
    on: "before-tool",
    run({ call, step }) {
      if (call.name === "write_file" && step > 20)
        return { deny: "Stop editing and summarize your changes." };
    },
  }),
  defineHarnessHook({
    on: "stop",
    run({ text }) {
      if (!text.includes("npm test"))
        return { continue: "Run npm test and report its result." };
    },
  }),
];
```

Passez la liste à `createHarness({ hooks })`. Un hook qui ne renvoie rien laisse la boucle inchangée.

| Phase           | Reçoit                                     | Peut renvoyer                                                              |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `session-start` | `prompt`                                   | `{ instructions }`, ajouté aux instructions système.                       |
| `before-model`  | Les `messages` sur le point d’être envoyés | Rien : observer, ou lever une exception pour arrêter le tour.              |
| `after-model`   | Le `result` du modèle                      | Rien : observer, ou lever une exception pour arrêter le tour.              |
| `before-tool`   | `call` (`name`, `input`)                   | `{ deny }` pour refuser l’appel, ou `{ input }` pour remplacer son entrée. |
| `after-tool`    | `call` et `result` (`content`, `isError`)  | `{ result }` pour remplacer ce que reçoit le modèle.                       |
| `stop`          | Le `text` final                            | `{ continue }` pour envoyer une nouvelle instruction au lieu de terminer.  |

Chaque phase reçoit aussi `sandbox`, `signal`, `model` et `step`.

## Savoir ce qui s’exécute en premier

<!-- flow -->

1. **Contrôle**: Avant l’exécution de l’outil.
   - **Validation**: L’entrée doit respecter le schéma de l’outil.
   - **Évaluation des permissions**: Un refus termine l’appel ; les hooks ne s’exécutent pas.
     - `permissions`
   - **Hooks before-tool**: Dans l’ordre de déclaration. Un `deny` arrête la chaîne ; un `input` passe au hook suivant.
     - `before-tool`
   - **Nouveau contrôle après réécriture**: Outpost valide la nouvelle entrée et réévalue les permissions.
     - `permissions`
2. **Exécution**: L’outil s’exécute dans la sandbox.
3. **Retour**: Le modèle reçoit le résultat.
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
