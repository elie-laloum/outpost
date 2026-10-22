---
title: "Utiliser du code local dans une recette"
description: "Relier des fonctions et composants locaux de confiance aux tâches YAML."
---

Utilisez une extension locale pour une transformation, un hook ou un client fourni par votre application. Les extensions appartiennent à la [configuration d’exécution](../recipe-configuration/) et s’exécutent sur l’hôte avec ses permissions. Relisez ce code avant de lancer la recette.

## Déclarer des actions locales

Pour une transformation complexe, `call` sélectionne un callback explicitement configuré et `arguments` construit son entrée JSON. Le callback reçoit cette valeur et le contexte natif de tâche : annulation, déclaration de consommation et clé d’idempotence. Sa valeur de retour doit être du JSON sans perte. La recette partageable choisit une référence déclarée ; elle ne peut ajouter aucun import de module.

```yaml title="recipe.yaml"
version: 3
name: summarize-files
tasks:
  - key: select
    value: [src/index.ts, src/parser.ts]
  - key: summarize
    after: [select]
    call: { $ref: functions.summary }
    arguments: { $step: select, path: [value] }
```

Enregistrez cette configuration locale complète. Ces tâches de données ne demandent ni workspace ni sandbox. Un alias dans `functions` garde la recette indépendante des noms de modules locaux. La validation résout ces métadonnées sans importer le module ; l’exécution vérifie son export avant l’allocation.

```yaml title="outpost.yaml"
version: 3
extensions:
  summary:
    module: ./steps.ts
    export: summary
    kind: callback
    contract: call.options.perform
    version: "1"
functions:
  summary: { $ref: extensions.summary }
```

Enregistrez ce module à côté de la configuration. Il vérifie son entrée avant de rendre un objet JSON.

```ts title="steps.ts"
export function summary(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected file names");
  return { count: value.length, files: value };
}
```

Enregistrez les deux fichiers YAML et `steps.ts` ensemble. Exécutez `npx outpost recipe validate --file recipe.yaml --config outpost.yaml`, puis la même commande avec `run --json`. La sortie `summarize.value` contient `count: 2` et les deux chemins.

`loop` accepte `maxRounds`, `attempt` et `check` via [defineLoopTask](../../reference/definelooptask/). Liez les callbacks avec `loop.options.attempt` et `loop.options.check` ; le résultat d’une tentative devient le `value` JSON de l’étape, tandis que le contrôle reçoit le résultat sans enveloppe. Le moteur existant maintient l’historique des tours et la consommation. Les boucles refusent les options ordinaires de retry, gate et interaction.

`decision` accepte fournisseur, modèle, contrat de décision et politique de troncature de [defineDecisionTask](../../reference/definedecisiontask/). Une expression `state` séparée fournit le contexte structuré et le résultat est accessible dans `value`. Une requête de décision n’alloue pas de sandbox.

## Réutiliser des objets observateurs locaux

Déclarez les extensions uniquement dans la configuration locale. Un module peut exporter un objet déjà construit, emprunté pour l’invocation, ou une factory avec un JSON Schema statique et un nettoyage explicitement nommé. La validation statique contrôle ces déclarations sans importer le module ; la validation runtime vérifie l’export réel avant allocation.

```yaml title="outpost.yaml — observateur emprunté"
extensions:
  audit:
    module: ./audit.ts
    export: sink
    kind: sink
    version: "1"
observation:
  sinks:
    - $ref: extensions.audit
```

L’export `sink` implémente `ObservationSink`. Le runtime ne ferme jamais un objet emprunté. Pour une factory, ajoutez `factory: true`, `schema`, puis éventuellement `options` et `dispose`, nommant un autre export. La factory reçoit ses options et un contexte avec annulation, dossier de configuration et résolution des composants nommés. Seuls les modules locaux et paquets déjà installés sont acceptés ; une recette téléchargée ne peut pas importer elle-même ses extensions.

Le point d’entrée `/recipes` expose `defineRecipeComponent`, `createRecipeRegistry`, `validateRecipeProject` et `createRecipeRuntime`. La construction du runtime valide sans allouer ; `run()` alloue et nettoie chaque invocation, et `close()` annule une invocation active et empêche les suivantes. `examples/65-recipe-observation/` vérifie observation et rapports déclarés sans appel de modèle.

L’inventaire `recipes/parity.json` classe exports et options publics des sept lots. Les [composants disponibles](../yaml-components/) sont générés depuis le registre ; la [composition avancée](../recipe-advanced/) explique expérimentation, intégration et limites des validations live. Fonctions d’extension et utilitaires immédiats conservent leurs contrats TypeScript.

## Brancher des callbacks typés locaux

Les callbacks restent dans des modules locaux sélectionnés par la configuration. Leur `contract` statique nomme l’option de composant qu’ils implémentent. La validation refuse un callback destiné à une autre option avant chargement du module ; le runtime vérifie ensuite que l’export est une fonction avant allocation de la sandbox. Les résultats restent soumis à la validation du moteur natif.

```yaml title="outpost.yaml — extension de hook"
extensions:
  before:
    module: ./hooks.ts
    export: before
    kind: callback
    contract: hook.custom.run
    version: "1"
hooks:
  before:
    type: custom
    on: before-model
    run: { $ref: extensions.before }
```

Attachez le hook au harness avec `hooks: [{ $ref: hooks.before }]`. Appliquez le même modèle à l’exécution d’outils, au contexte personnalisé, aux instructions et à l’état du routage ; les erreurs indiquent le contrat attendu. Les factories peuvent aussi recevoir des références typées par les annotations de leur schéma. Les composants possédés sont fermés dans l’ordre des dépendances ; les erreurs de fermeture des observateurs figurent dans `observerErrors` sans modifier la réussite des tâches.

Composez valeurs JSON, conditions, boucles, décisions et tâches isolées avec les [workflows de format 3](../recipe-workflows/). Une recette de données seule n’alloue aucune sandbox.

## Utiliser le moteur en TypeScript

Enregistrez `run-recipe.ts` à côté des deux fichiers de [votre première recette YAML](../yaml-recipes/). Lancez `node run-recipe.ts` dans un projet ESM. `createRecipeRuntime()` utilise la même configuration que la CLI et possède ses ressources ; `await using` le ferme après exécution.

```ts title="run-recipe.ts"
import { fileURLToPath } from "node:url";
import { createRecipeRuntime } from "@elie-laloum/outpost/recipes";

await using runtime = await createRecipeRuntime({
  file: fileURLToPath(new URL("./recipe.yaml", import.meta.url)),
  config: fileURLToPath(new URL("./outpost.yaml", import.meta.url)),
});
await runtime.run({ report: "json" });
```

Pour une sandbox déjà ouverte, [defineRecipe](../../reference/definerecipe/) l’emprunte : l’appelant possède l’intégration et le nettoyage. Les options de workflow, checkpoints et références de composants nécessitent le runtime complet.
