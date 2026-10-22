---
title: "Choisir le workspace d’une recette"
description: "Partir de zéro, copier ou monter des fichiers, ou conserver le travail sur une branche Git."
---

Gardez le `recipe.yaml` de [votre première recette](../yaml-recipes/). Modifiez `outpost.yaml` pour choisir où les tâches lisent et écrivent. Les chemins sont relatifs à ce fichier de configuration.

| Fichiers de départ          | Workspace                             | Devenir des modifications                              |
| --------------------------- | ------------------------------------- | ------------------------------------------------------ |
| Dossier vide                | `ephemeral`                           | Publier les sorties choisies pour les conserver        |
| Copie d’un dossier existant | `directory` avec `access: copy`       | Source inchangée ; publication des sorties choisies    |
| Dossier monté               | `directory` avec `access.mode: mount` | Un montage en écriture modifie immédiatement la source |
| Dépôt Git                   | `git` avec `branch.mode: named`       | Un worktree séparé conserve la branche pour relecture  |

## Conserver les fichiers produits

Ajoutez ce bloc `outputs` à la racine du `outpost.yaml` du tutoriel. Après une exécution réussie, `results/hello.txt` contient le message généré.

```yaml title="outpost.yaml — outputs"
outputs:
  - paths: [hello.txt]
    destination: ./results
    policy: create
```

`create` refuse une destination existante. Pour relancer, choisissez une nouvelle destination ou demandez explicitement `update`. La publication vérifie les modifications concurrentes et conserve les données de récupération en cas de conflit ; voir [publier des fichiers](../publishing-files/).

## Partir d’un dossier

Créez `documents` à côté de la configuration, puis remplacez `outpost.yaml` par ce fichier. Les tâches travaillent sur une copie ; les documents originaux restent inchangés. Le message du tutoriel est publié dans `results`.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: directory
  directory: ./documents
  access: copy
sandbox:
  provider: local
outputs:
  - paths: [hello.txt]
    destination: ./results
    policy: create
```

Seules les sorties sélectionnées sont publiées. Pour repartir à vide, remplacez tout le bloc `workspace` par `workspace: { kind: ephemeral }`.

## Utiliser une branche Git

Pour un dépôt situé dans `./project` possédant une branche `main`, utilisez cette configuration. Outpost crée ou ouvre la branche nommée dans un worktree géré. Toutes les tâches ordinaires de commandes et d’agents le partagent.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch:
    mode: named
    name: feature/hello
    from: main
sandbox:
  provider: local
```

`from` choisit le commit de départ lors de la création de la branche. `named` conserve le worktree sans le fusionner dans votre checkout ; `integrate` demande une intégration après réussite, et `current` travaille directement dans le checkout choisi. Déclarez toujours cette politique explicitement. Les `outputs` de fichiers ne s’appliquent pas à un workspace Git.

Donnez un nom de branche distinct aux travaux indépendants. Pour plusieurs branches dans une recette, déclarez [plusieurs workspaces](#utiliser-plusieurs-workspaces) ou utilisez des [tâches isolées](../recipe-workflows/#travailler-sur-des-branches-séparées) ; changer de rôle d’agent ne crée pas de workspace supplémentaire.

## Monter un dossier dans un conteneur

Cette configuration complète monte `documents` en lecture seule sous le chemin `documents` du workspace. Docker doit fonctionner ; il peut télécharger l’image publique `node:24`. Les commandes lisent alors `documents/...` ; le tutoriel peut toujours écrire son message à la racine du workspace.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: directory
  directory: ./documents
  access:
    mode: mount
    target: documents
    readOnly: true
sandbox:
  provider: docker
  image: node:24
```

Passez à `readOnly: false` uniquement pour modifier immédiatement les fichiers source. Un retour arrière de la publication ne peut pas annuler ces écritures. Le montage demande un fournisseur compatible ; `local` ne le prend pas en charge. Voir [travailler sur des fichiers](../working-with-files/).

## Changer de sandbox sur un même workspace

Nommez chaque sandbox sous `sandboxes`, puis choisissez-en une sur une tâche avec `sandbox:`. Les tâches sans `sandbox:` utilisent la `sandbox` de premier niveau. Docker et Podman doivent être démarrés ; tous deux peuvent télécharger l’image publique `node:24`.

```yaml title="outpost.yaml — sandboxes"
version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
outputs:
  - paths: [notes.txt]
    destination: ./results
    policy: create
sandboxes:
  docker: { provider: docker, image: node:24 }
  podman: { provider: podman, image: node:24 }
```

Quand une tâche choisit une autre sandbox du même workspace, Outpost ferme la sandbox courante et ouvre la suivante sur les mêmes fichiers. `review` lit donc le `notes.txt` écrit par `draft` ; un worktree Git conserve de la même façon les modifications non commitées. Une seule sandbox par workspace est ouverte à la fois : ordonnez ces tâches avec `after`.

```yaml title="recipe.yaml — sandboxes"
version: 3
name: two-sandboxes
tasks:
  - key: draft
    sandbox: docker
    command:
      executable: sh
      arguments: [-c, "echo drafted in Docker > notes.txt"]
  - key: review
    sandbox: podman
    after: [draft]
    command:
      executable: sh
      arguments: [-c, "cat notes.txt && echo reviewed in Podman >> notes.txt"]
```

Après l’exécution, `results/notes.txt` contient les deux lignes. Seules les tâches de commande et d’agent choisissent une sandbox ; les tâches isolées gardent la leur.

## Utiliser plusieurs workspaces

Déclarez d’autres workspaces Git ou de fichiers sous `workspaces`. Une sandbox ouvre le workspace de premier niveau, sauf si son champ `workspace` en référence un autre.

```yaml title="outpost.yaml — workspaces"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: feature/app, from: main }
sandbox: { provider: local }
workspaces:
  docs:
    kind: git
    repository: ./project
    branch: { mode: named, name: feature/docs, from: main }
sandboxes:
  writer:
    workspace: { $ref: workspaces.docs }
    provider: local
```

Une tâche avec `sandbox: writer` travaille sur le worktree `feature/docs` ; les autres tâches gardent `feature/app`. Deux workspaces d’un même dépôt exigent des branches distinctes. Après l’exécution, chaque workspace est intégré ou conservé séparément, et le rapport liste les workspaces nommés sous `workspaces`.

Avec `workflow.concurrency`, les tâches de workspaces différents peuvent s’exécuter en même temps ; celles d’un même workspace doivent rester ordonnées.

### Mélanger workspaces Git et de fichiers

```yaml title="outpost.yaml — workspaces Git et de fichiers"
version: 3
workspace:
  kind: git
  repository: ./project
sandbox: { provider: local }
runtime: { directory: .outpost }
workspaces:
  notes:
    kind: ephemeral
    outputs:
      - paths: ["*.md"]
        destination: ./notes
        policy: create
sandboxes:
  writer:
    workspace: { $ref: workspaces.notes }
    provider: local
```

Les tâches sans `sandbox` travaillent sur le worktree Git ; celles avec `sandbox: writer` travaillent sur les fichiers éphémères. Chaque workspace se termine selon son type : les workspaces Git sont intégrés, ceux de fichiers publient leurs `outputs`. Les exécutions durables enregistrent les deux types dans le même checkpoint.

| Workspace de premier niveau | Déclare pour l’autre type                           |
| --------------------------- | --------------------------------------------------- |
| Git                         | `runtime` pour l’état de ses workspaces de fichiers |
| Fichiers                    | `integration` pour ses workspaces Git               |

Les vérifications de chaque type suivent le workspace de la tâche : une tâche d’agent dans un workspace de fichiers exige un agent qui prend en charge les fichiers et ne peut pas utiliser `{{ WORK_BRANCH }}`. Les tâches isolées, interactives et de spéculation gardent le type du workspace de premier niveau.

## Exécuter un agent sur des fichiers

Les workspaces de fichiers acceptent aussi les [agents CLI natifs](../recipe-configuration/) dont les adaptateurs déclarent les capacités nécessaires. Préparez l’[image de l’agent](../agent-images/) et son authentification explicite, puis sélectionnez son rôle dans la recette. Les réparations, reprises ou modes interactifs non pris en charge sont refusés. Consultez les [capacités validées](../working-with-files/#état-de-validation-des-cli-natives) avant de choisir un agent.

## Conserver l’état entre les exécutions

Pour les checkpoints et la restauration des conversations, suivez [enregistrer la progression](../recipe-durability/). La configuration de fichiers utilise `runtime.directory` pour l’état et `runtime.namespace` pour son identité. La conservation et les snapshots portables sont décrits dans [reprendre un workspace de fichiers](../resuming-file-workspaces/).
