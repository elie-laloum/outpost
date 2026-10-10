---
title: "Composer des workflows YAML"
description: "Transmettre des valeurs JSON, choisir des conditions et composer des tâches isolées avec le moteur existant."
---

Étendez [votre première recette](../yaml-recipes/) lorsque les étapes suivantes ont besoin de résultats structurés ou de conditions. Enregistrez le premier bloc dans `recipe.yaml`, passez le champ `version` à la racine de votre `outpost.yaml` à `2`, puis lancez `npx outpost recipe run --file recipe.yaml --config outpost.yaml --json`. Le résultat `envelope` contient les noms de fichiers sélectionnés.

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

Les `options` d’une tâche suivent [TaskOptions](../../reference/taskoptions/), sans clé, objets de dépendances ni action. Le bloc `workflow` suit [WorkflowOptions](../../reference/workflowoptions/) ; le runtime fournit l’annulation et le hub d’observation commun. Retries, délais, budgets, politique d’erreur et callbacks conservent le comportement du moteur. Configurez le stockage pour [reprendre les recettes durables](../recipe-durability/) avec leurs workspaces d’origine.

```yaml title="recipe.yaml — politique d’exécution"
workflow:
  concurrency: 3
  stopOnError: false
  budget: { attempts: 10 }
```

Les commandes et agents sur une sandbox partagée restent séquentiels par défaut. Si la concurrence peut faire chevaucher deux tâches partagées, la validation refuse la recette ; ordonnez-les avec des dépendances ou utilisez `isolated`. Les tâches de données, callbacks et décisions n’allouent aucune sandbox. Chaque requête isolée choisit son dépôt, fournisseur, agent et sa politique de branche via [defineIsolatedTask](../../reference/defineisolatedtask/). Les requêtes concurrentes sur un même workspace emprunté ou courant sont refusées.

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

<span id="déclarer-des-actions-locales"></span>

Pour cette étape, suivez [Appeler des actions locales depuis YAML](../recipe-callbacks/).

## Exécuter l’exemple hors ligne

`examples/68-recipe-workflows` compose des paramètres structurés, une condition, une transformation locale et une boucle de deux tours. Après compilation d’Outpost, lancez `node --test examples/68-recipe-workflows/index.ts`. Cet exemple n’alloue aucune sandbox et n’appelle aucun modèle. Les tests fonctionnels comparent aussi la consommation YAML et TypeScript et exécutent des agents de test isolés sur deux vrais dépôts Git temporaires ; la validation cloud et les appels payants restent séparés.

## Réutiliser le résultat d’une étape

Un agent expose `text` ; une commande expose `stdout`, `stderr` et le nombre `status`. Ajoutez chaque étape référencée à `after`, même si une autre dépendance la suit déjà. Ajoutez cette tâche à [votre première recette YAML](../yaml-recipes/) pour résumer la revue :

```yaml title="recipe.yaml — append to tasks"
- key: summary
  after: [review]
  agent: coder
  brief: "Summarize these findings without editing files: {{ steps.review.text }}"
```

Le moteur transmet le résultat réel à l’étape suivante. Les rapports CLI limitent chaque champ textuel retourné à 16 384 caractères avec un marqueur de troncature explicite. Les références transmettent des données, sans continuer une conversation ; les fichiers restent partagés dans le workspace de la sandbox.
