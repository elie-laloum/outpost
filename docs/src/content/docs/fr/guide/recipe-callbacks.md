---
title: "Appeler des actions locales depuis YAML"
description: "Reliez une tâche YAML à un callback local déclaré."
---

Partez de [Composer des workflows YAML](../recipe-workflows/) et de sa configuration. Reliez une tâche YAML à un callback local déclaré.

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

Déclarez le module, l’export, sa version et le contrat du callback dans la configuration locale. Un alias dans `functions` garde la recette indépendante des noms de modules locaux. La validation résout ces métadonnées sans importer le module ; l’exécution vérifie son export avant l’allocation.

```yaml title="outpost.yaml — liaison du callback"
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

Remplacez la recette précédente par ce `recipe.yaml` et ajoutez les déclarations `extensions` et `functions` à votre `outpost.yaml` de version 2. Exécutez `npx outpost recipe validate --file recipe.yaml --config outpost.yaml`, puis la même commande avec `run --json`. La sortie `summarize.value` contient `count: 2` et les deux chemins.

`loop` accepte `maxRounds`, `attempt` et `check` via [defineLoopTask](../../reference/definelooptask/). Liez les callbacks avec `loop.options.attempt` et `loop.options.check` ; le résultat d’une tentative devient le `value` JSON de l’étape, tandis que le contrôle reçoit le résultat sans enveloppe. Le moteur existant maintient l’historique des tours et la consommation. Les boucles refusent les options ordinaires de retry, gate et interaction.

`decision` accepte fournisseur, modèle, contrat de décision et politique de troncature de [defineDecisionTask](../../reference/definedecisiontask/). Une expression `state` séparée fournit le contexte structuré et le résultat est accessible dans `value`. Une requête de décision n’alloue pas de sandbox.
