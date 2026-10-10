---
title: "Configurer l’exécution d’une recette"
description: "Choisir le dépôt, les agents, l’environnement et les rapports dans outpost.yaml."
---

Gardez la recette partageable et placez les choix propres à votre machine dans `outpost.yaml`. Partez de [votre première recette](../yaml-recipes/) ; les sections suivantes adaptent son exécution sans modifier ses tâches.

## Configurer l’exécution une fois

Construisez l’image avec la [configuration initiale](../setup/), puis enregistrez cet `outpost.yaml`. Les chemins du dépôt et des fichiers de session partent du répertoire de ce fichier.

```yaml title="outpost.yaml"
version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:dev
branch:
  mode: named
  name: outpost/recipe-change
agents:
  coder:
    harness: codex
    authentication: account
  reviewer:
    harness: codex
    authentication: account
```

Changez d’environnement avec `sandbox.provider` : voir [le choix de sandbox](../choose-a-sandbox/). Les options incompatibles sont refusées ; les fournisseurs cloud demandent leur SDK optionnel et des identifiants sur l’hôte. Le fournisseur `local` exécute directement sur votre machine.

Déclarez [l’authentification](../authentication/) de chaque agent et, si nécessaire, un nom de modèle ou `{ name, reasoning, maxOutputTokens }`. Référencez les identifiants par fichier ou nom de variable ; les secrets littéraux sont refusés. Seules les variables sélectionnées dans `environment` atteignent la sandbox.

```yaml title="outpost.yaml — sélection optionnelle de variables"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

La CLI ouvre et ferme la sandbox. Cet exemple conserve une branche nommée pour relecture. Sans politique de branche explicite, l’exécution YAML intègre les changements dans votre checkout ; choisissez `current` ou `named` pour un autre comportement. Les chaînes de configuration restent littérales.

## Activer les suggestions de l’éditeur

Avec un serveur de langage YAML, ajoutez le commentaire de schéma à la recette. La recette et la configuration d’exécution ont des versions de format indépendantes.

```yaml title="recipe.yaml — schéma de l’éditeur"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
```

La configuration d’exécution possède son propre schéma et sa propre version de format. Utilisez cet en-tête dans `outpost.yaml` pour obtenir les suggestions de sandbox, agents, observation et composants nommés :

```yaml title="outpost.yaml — schéma de l’éditeur"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 2
```

Ces URL suivent la documentation stable courante. Pour figer les suggestions, utilisez `/outpost/schemas/<version-du-paquet>/recipe.schema.json` ou `recipe-configuration.schema.json`, sans `v` devant la version. Les archives n’existent que pour les versions qui incluaient les deux fichiers. Cette version est distincte du champ `version` du YAML.

Avant publication de ces schémas, ou hors ligne, utilisez ceux du paquet installé ou un chemin local. `recipe init` utilise déjà le schéma installé.

## Composer les composants natifs de configuration

Avec la version 2 de la configuration, `$ref` réutilise un composant nommé. Gardez `version: 2` et `repository` dans le fichier, puis ajoutez ces déclarations. Les références inconnues, types incompatibles et cycles sont refusés avant allocation.

```yaml title="outpost.yaml — provider nommé"
sandbox:
  $ref: sandboxProviders.build
sandboxProviders:
  build:
    type: docker
    image: outpost:sandbox
    repositoryMode: isolated
    cpus: 2
    memoryMb: 4096
```

Consultez les [options des fournisseurs](../choose-a-sandbox/) pour les montages, caches et restrictions réseau. Firecracker est expérimental : il exige `experimental: true` et un hôte préparé séparément.

Placez la préparation, les protections et le stockage sous `workspace`. Gardez dépôt, branche, sandbox et observation à la racine. Les chemins hôte partent du fichier de configuration ; les chemins de sandbox suivent les règles du fournisseur.

```yaml title="outpost.yaml — préparation du workspace"
workspace:
  guard:
    protectedPaths: [".github/**"]
  hooks:
    sandboxReady:
      - executable: npm
        arguments: [ci]
        when:
          kind: changed
          files: [package-lock.json]
```

Partagez les instructions et permissions d’outils via un [profil d’agent](../agent-profiles/) nommé. Chaque harness vérifie qu’il peut appliquer les permissions demandées.

```yaml title="outpost.yaml — profil partagé"
profiles:
  reviewer:
    type: portable
    instructions: Review the change without editing files.
    allowedTools: [read]
agents:
  reviewer:
    harness: claude
    authentication: account
    profile:
      $ref: profiles.reviewer
```

## Workspaces de fichiers

La configuration 3 ajoute des sources explicites de dossier et éphémères. [Workspaces](../workspaces/) présente les sources de fichiers, la restitution et les montages explicites. Les configurations 1 et 2 conservent leurs contrats Git.

## Pour aller plus loin

- [Suivre une recette](../recipe-observation/)
- [Configurer la boucle d’agent intégrée](../recipe-harness/)
- [Sélectionner des secrets](../secret-sources/)

<span id="déclarer-lobservation-et-les-rapports-finaux"></span>
<span id="déclarer-les-rapports-et-la-télémétrie"></span>

<span id="sélectionner-les-secrets-avant-allocation"></span>

<span id="exécuter-le-harness-outpost-depuis-le-yaml"></span>
