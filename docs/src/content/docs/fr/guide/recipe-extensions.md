---
title: "Utiliser du code local dans une recette"
description: "Relier des fonctions et composants locaux de confiance aux tâches YAML."
---

Utilisez une extension locale pour une transformation, un hook ou un client fourni par votre application. Les extensions appartiennent à la [configuration d’exécution](../recipe-configuration/) et s’exécutent sur l’hôte avec ses permissions. Relisez ce code avant de lancer la recette.

Pour une première transformation exécutable avec son module, suivez [Appeler une action locale](../recipe-callbacks/). Cette page traite ensuite les objets partagés et leur durée de vie.

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

Reprenez le `recipe.yaml` de [votre première recette YAML](../yaml-recipes/). `defineRecipe()` emprunte la sandbox et retourne un [Workflow](../../reference/type-workflow/). Ici, l’appelant possède l’intégration, la préservation et le nettoyage ; le moteur exécute seulement les tâches. Transmettez des valeurs typées dans `inputs` et inspectez les résultats avec l’API habituelle des workflows.

```ts title="run-recipe.ts"
import { readFile } from "node:fs/promises";
import { createSandbox, defineRecipe } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

const sandbox = await createSandbox({ repository, sandboxProvider });
try {
  const source = await readFile(
    new URL("./recipe.yaml", import.meta.url),
    "utf8",
  );
  const workflow = defineRecipe(source, {
    sandbox,
    agents: { coder },
    inputs: { focus: "installation instructions" },
  });
  (await workflow.start()).unwrap();
  await sandbox.workspace.integrate();
} finally {
  await sandbox.close({ preserve: true });
}
```

Dans cet exemple séquentiel, la sandbox partagée exige une concurrence de 1. Utilisez les [recettes YAML durables](../recipe-durability/) pour les checkpoints de format 3 et les projections JSON. Le [contrat de recette](../../reference/definerecipe/) décrit les limites de validation.
