---
title: "Transmettre des données et composer les étapes"
description: "Utiliser paramètres typés, résultats, conditions et un workspace par branche."
---

Gardez le `outpost.yaml` du [tutoriel local](../yaml-recipes/) et remplacez `recipe.yaml` par le premier exemple. Ces tâches transforment des données et n’allouent aucune sandbox.

## Transmettre paramètres et résultats

`$input` lit un paramètre typé ; `$step` lit une tâche terminée. Chaque tâche lue doit figurer directement dans `after`. Le schéma d’entrée vérifie l’objet avant exécution. `when` ignore `envelope` si la liste de fichiers est vide.

```yaml title="recipe.yaml"
version: 3
name: select-files
inputs:
  changes:
    type: object
    description: Files to inspect.
    default: { files: [src/index.ts] }
    schema:
      type: object
      properties:
        files: { type: array, items: { type: string } }
      required: [files]
      additionalProperties: false
tasks:
  - key: select
    value: { $input: changes, path: [files] }
  - key: envelope
    after: [select]
    when:
      ne: [{ $step: select, path: [value] }, []]
    value:
      files: { $step: select, path: [value] }
```

Lancez avec une entrée JSON. Le champ `outputs.envelope.value.files` du rapport contient `["a.ts"]`.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'changes={"files":["a.ts"]}' --json
```

## Choisir le type de référence

Utilisez les références typées dans les expressions de données et l’interpolation textuelle dans les briefs ou arguments de commandes. Les données interpolées ne sont développées qu’une fois.

| Besoin                               | Exemple                               |
| ------------------------------------ | ------------------------------------- |
| Un paramètre typé                    | `{ $input: changes, path: [files] }`  |
| La valeur JSON d’une tâche           | `{ $step: select, path: [value] }`    |
| La sortie d’une commande comme texte | `"Output: {{ steps.check.stdout }}"`  |
| La réponse finale d’un agent         | `"Review: {{ steps.review.text }}"`   |
| Un objet littéral opaque             | `{ $literal: { $input: unchanged } }` |

Les conditions acceptent `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`, `all`, `any` et `not`. Le [schéma d’éditeur](../recipe-configuration/) propose leurs formes. Une référence transmet une donnée ; elle ne continue pas la conversation d’un agent.

## Travailler sur des branches séparées

Pour deux modifications indépendantes dans `./project`, utilisez ces fichiers complets. Préparez d’abord l’[image Codex et l’accès au compte](../setup/). Chaque tâche `isolated` possède son workspace et sa sandbox ; les branches restent séparées après exécution.

```yaml title="recipe.yaml"
version: 3
name: parallel-changes
workflow:
  concurrency: 2
tasks:
  - key: docs
    isolated:
      repository: ./project
      sandboxProvider: { $ref: sandboxProviders.container }
      agent: { $ref: agents.coder }
      branch: { mode: named, name: feature/docs, from: main }
      brief: { text: Improve the README and commit the changes. }
  - key: tests
    isolated:
      repository: ./project
      sandboxProvider: { $ref: sandboxProviders.container }
      agent: { $ref: agents.coder }
      branch: { mode: named, name: feature/tests, from: main }
      brief: { text: Add regression tests and commit the changes. }
```

La configuration locale fournit la déclaration de fournisseur partagée et l’agent. Le workspace à la racine sélectionne le mode Git ; ces tâches isolées n’allouent que leurs propres workspaces, avec le dépôt déclaré dans chaque tâche. Les chemins relatifs des dépôts partent de `outpost.yaml`.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: orchestration, from: main }
sandbox: { provider: local }
sandboxProviders:
  container:
    type: docker
    image: outpost-codex:dev
agents:
  coder:
    harness: codex
    authentication: account
```

Exécutez avec la même commande `recipe run`, sans `--input`. Utilisez des chemins de dépôt différents pour travailler sur plusieurs repositories. L’intégration, lorsqu’elle est demandée, reste indépendante pour chaque dépôt ; il n’existe aucune transaction Git commune.

## Recommencer jusqu’à ce qu’une vérification passe

Une tâche `loop` répète une tentative d’agent jusqu’à ce que sa vérification accepte le travail, en au plus `maxRounds` tours. La tentative et la vérification s’exécutent dans le workspace configuré, comme les tâches `agent` et `command`. Cette recette utilise le rôle `coder` de la configuration ci-dessus, avec `workspace` pointant vers votre projet.

```yaml title="recipe.yaml — loop"
version: 3
name: fix-until-green
inputs:
  goal: { type: string, description: The change to implement. }
tasks:
  - key: fix
    loop:
      maxRounds: 3
      attempt:
        agent: coder
        brief: "Implement this change and commit it: {{ inputs.goal }}"
        conversation: continue
      check:
        command: { executable: npm, arguments: [test] }
  - key: summary
    after: [fix]
    value: "{{ steps.fix.text }} after {{ steps.fix.rounds }} rounds"
```

La vérification accepte la tentative quand `npm test` se termine avec le statut 0. Sinon, son statut de sortie et les 4 000 derniers caractères de stdout et stderr deviennent le retour du tour. La sortie de la commande est observée comme celle d’une tâche `command`.

`conversation: continue` envoie les tours suivants dans la conversation de la tentative : `followUp` si vous le déclarez, sinon un message intégré qui contient le retour. Avec la valeur par défaut `conversation: new`, chaque tour démarre une nouvelle conversation ; le brief doit donc contenir `{{ loop.feedback }}`, sinon la validation le refuse.

Pour confier la décision à un autre agent, remplacez la commande par `check: { agent: reviewer, brief: "Review the last commit: {{ loop.text }}" }`. Outpost demande au relecteur une réponse `{ done, feedback }`, dans une nouvelle conversation à chaque tour.

| Valeur                | Disponible dans                       | Contenu                                      |
| --------------------- | ------------------------------------- | -------------------------------------------- |
| `{{ loop.round }}`    | Tentative, vérification et commande   | Numéro du tour, à partir de 1                |
| `{{ loop.feedback }}` | `brief` et `followUp` de la tentative | Retour du tour refusé ; vide au premier tour |
| `{{ loop.text }}`     | `brief` d’une vérification par agent  | Réponse finale de la tentative du tour       |

`outputs.fix` contient le `text`, la `conversation` et la `value` de la dernière tentative, les `commits` de tous les tours et `rounds`. Quand le dernier tour est refusé, la tâche échoue avec un message qui se termine par son retour, limité à 2 000 caractères. L’événement `loop` de chaque tour refusé porte son retour, masqué par `workflow.redact`.

`attempt.dispatch` accepte les [options de dispatch d’une tâche agent](../../reference/dispatchoptions/) sauf `continuation` ; une conversation poursuivie exige aussi une seule passe. `quotaResume` s’applique à la tentative et à une vérification par agent. Une boucle n’a pas de `retry` ; `timeoutMs` borne chaque tour. Avec un [checkpoint](../recipe-durability/), une exécution reprise vérifie une tentative sauvegardée sans la refaire. Poursuivre une conversation dans une nouvelle sandbox après une reprise exige un agent qui capture ses conversations.

## Régler l’exécution

Ajoutez ce bloc à la racine d’une recette dont les tâches peuvent s’exécuter en parallèle. Les `options` d’une tâche peuvent aussi fixer retries et délais ; voir [TaskOptions](../../reference/taskoptions/) et [WorkflowOptions](../../reference/workflowoptions/).

```yaml title="recipe.yaml — workflow"
workflow:
  concurrency: 2
  stopOnError: false
  budget: { attempts: 10 }
```

Les commandes et agents ordinaires partagent le workspace configuré. Ordonnez-les avec `after` ; la validation refuse leur utilisation concurrente de ce workspace. Utilisez des tâches isolées pour les travaux indépendants.

Continuez avec les [callbacks et boucles par callbacks](../recipe-extensions/#déclarer-des-actions-locales), les [réponses structurées des agents](../recipe-harness/) ou les [checkpoints](../recipe-durability/).

<!-- Retained section anchors for existing bookmarks. -->

<span id="transmettre-des-valeurs-structurées"></span>
<span id="choisir-une-condition"></span>
<span id="réutiliser-les-contrats-typescript"></span>
<span id="exécuter-lexemple-hors-ligne"></span>
<span id="réutiliser-le-résultat-dune-étape"></span>
<span id="déclarer-des-actions-locales"></span>
