---
title: "Composer des workflows YAML"
description: "Transmettre des valeurs JSON, choisir des conditions et composer des tâches isolées avec le moteur existant."
---

## Transmettre des valeurs structurées

Le format de recette 3 et la configuration 2 étendent les [recettes YAML](../yaml-recipes/) avec des paramètres JSON et la composition de workflows. Conservez deux fichiers séparés. Objets, tableaux et null complètent les paramètres scalaires ; un `schema` JSON facultatif valide les valeurs imbriquées avant le chargement des extensions et l’allocation. Une valeur passée par `--input 'changes={"files":["a.ts"]}'` conserve son type.

```yaml title="recipe.yaml"
version: 3
name: select-files
inputs:
  changes:
    type: object
    description: Files to inspect.
    default: { files: [src/index.ts] }
tasks:
  - key: select
    value: { $input: changes, path: [files] }
  - key: envelope
    after: [select]
    value:
      files: { $step: select, path: [value] }
      source: community
```

`value` construit un résultat JSON dans le champ `value` de l’étape. `$input` et `$step` renvoient des valeurs typées ; `path` sélectionne des propriétés propres ou des indices de tableau. `$select: { from: <expression>, path: [...] }` sélectionne une partie d’une autre expression. Les objets et tableaux ordinaires construisent de nouvelles valeurs. `$literal` garde toute sa valeur opaque, y compris les objets ressemblant à des références et les doubles accolades. Chaque étape référencée doit figurer directement dans `after`.

L’interpolation textuelle reste à passage unique et accepte seulement chaînes, nombres et booléens. Les commandes exposent `stdout`, `stderr` et `status`. Les résultats d’agents et de tâches isolées conservent leurs champs JSON, notamment `text`, `value`, `usage` et les références de conversation et de workspace ; les méthodes comme `resume()` ne sont pas sérialisées. Les formats 1 et 2 conservent leur comportement.

Les références textuelles peuvent sélectionner des feuilles scalaires comme `{{ steps.select.value.count }}` ou `{{ inputs.changes.summary }}`. Les noms de tâches contenant des points se résolvent avec le nom déclaré le plus long.

## Choisir une condition

Ajoutez `when` pour ignorer une tâche lorsque sa condition est fausse. Ses dépendants suivent les règles existantes du workflow. Les comparaisons conservent les types JSON ; l’égalité d’objets ignore l’ordre des clés. Les comparaisons d’ordre demandent deux nombres ou deux chaînes. `in` attend un tableau à droite. `exists` teste un chemin sans transformer l’absence d’un champ en erreur d’exécution.

```yaml title="recipe.yaml — condition d’une tâche"
when:
  all:
    - exists: { $input: changes, path: [files] }
    - ne: [{ $input: changes, path: [files] }, []]
```

Les opérateurs sont `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`, `all`, `any` et `not`. Un callback local peut utiliser `options.condition`, avec son contrat de callback généré. Déclarez soit `when`, soit le callback.

## Réutiliser les contrats TypeScript

Les `options` d’une tâche suivent [TaskOptions](../../reference/taskoptions/), sans clé, objets de dépendances ni action. Le bloc `workflow` suit [WorkflowOptions](../../reference/workflowoptions/) ; le runtime fournit l’annulation et le hub d’observation commun. Retries, délais, budgets, politique d’erreur et callbacks conservent le comportement du moteur. Les options durables demandent un stockage configuré ; une sandbox partagée durable est refusée tant que sa restauration n’est pas prise en charge.

```yaml title="recipe.yaml — politique d’exécution"
workflow:
  concurrency: 3
  stopOnError: false
  budget: { attempts: 10 }
```

Les commandes et agents sur une sandbox partagée restent séquentiels par défaut. Si la concurrence peut faire chevaucher deux tâches partagées, la validation refuse la recette ; ordonnez-les avec des dépendances ou utilisez `isolated`. Les tâches de données, callbacks et décisions n’allouent aucune sandbox. Chaque requête isolée choisit son dépôt, provider, agent et sa politique de branche via [defineIsolatedTask](../../reference/defineisolatedtask/). Les requêtes concurrentes sur un même workspace emprunté ou courant sont refusées.

```yaml title="recipe.yaml — tâche isolée"
- key: update-library
  isolated:
    repository: ./library
    sandboxProvider: { $ref: sandboxProviders.container }
    agent: { $ref: agents.coder }
    branch: { mode: integrate }
    brief: { text: Update and commit the library documentation. }
```

Les chemins des options natives se résolvent depuis le fichier de configuration locale. Chaque dépôt isolé s’intègre indépendamment, selon sa politique de branche ; aucune transaction ne couvre plusieurs dépôts.

## Déclarer des actions locales

Pour une transformation complexe, `call` sélectionne un callback explicitement configuré et `arguments` construit son entrée JSON. Le callback reçoit cette valeur et le contexte natif de tâche : annulation, déclaration de consommation et clé d’idempotence. Sa valeur de retour doit être du JSON sans perte. La recette partageable choisit une référence déclarée ; elle ne peut ajouter aucun import de module.

```yaml title="recipe.yaml — transformation"
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

`loop` accepte `maxRounds`, `attempt` et `check` via [defineLoopTask](../../reference/definelooptask/). Liez les callbacks avec `loop.options.attempt` et `loop.options.check` ; le résultat d’une tentative devient le `value` JSON de l’étape, tandis que le contrôle reçoit le résultat sans enveloppe. Le moteur existant maintient l’historique des tours et la consommation. Les boucles refusent les options ordinaires de retry, gate et interaction.

`decision` accepte provider, modèle, contrat de décision et politique de troncature de [defineDecisionTask](../../reference/definedecisiontask/). Une expression `state` séparée fournit le contexte structuré et le résultat est accessible dans `value`. Une requête de décision n’alloue pas de sandbox.

## Exécuter l’exemple hors ligne

`examples/68-recipe-workflows` compose des paramètres structurés, une condition, une transformation locale et une boucle de deux tours. Après compilation d’Outpost, lancez `node --test examples/68-recipe-workflows/index.ts`. Cet exemple n’alloue aucune sandbox et n’appelle aucun modèle. Les tests fonctionnels comparent aussi la consommation YAML et TypeScript et exécutent des agents de test isolés sur deux vrais dépôts Git temporaires ; la validation cloud et les appels payants restent séparés.
