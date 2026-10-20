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

Donnez un nom de branche distinct aux travaux indépendants. Pour plusieurs branches dans une recette, utilisez des [tâches isolées](../recipe-workflows/#travailler-sur-des-branches-séparées) ; changer de rôle d’agent ne crée pas de workspace supplémentaire.

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

## Exécuter un agent sur des fichiers

Les workspaces de fichiers acceptent aussi les [agents CLI natifs](../recipe-configuration/) dont les adaptateurs déclarent les capacités nécessaires. Préparez l’[image de l’agent](../agent-images/) et son authentification explicite, puis sélectionnez son rôle dans la recette. Les réparations, reprises ou modes interactifs non pris en charge sont refusés. Consultez les [capacités validées](../working-with-files/#état-de-validation-des-cli-natives) avant de choisir un agent.

## Conserver l’état entre les exécutions

Pour les checkpoints et la restauration des conversations, suivez [enregistrer la progression](../recipe-durability/). La configuration de fichiers utilise `runtime.directory` pour l’état et `runtime.namespace` pour son identité. La conservation et les snapshots portables sont décrits dans [reprendre un workspace de fichiers](../resuming-file-workspaces/).
