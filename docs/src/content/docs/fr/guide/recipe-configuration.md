---
title: "Ajouter un agent et choisir l’exécution"
description: "Configurer les rôles d’agents, l’exécution locale ou conteneurisée et les suggestions YAML."
---

`recipe.yaml` décrit le travail ; `outpost.yaml` associe les rôles aux agents et choisit l’environnement. Partez du [tutoriel local](../yaml-recipes/). La page [workspaces](../recipe-workspaces/) couvre les dossiers, branches et fichiers de sortie.

Utilisez les déclarations directes `sandbox` et `agents` pour les composants employés une seule fois. Introduisez `$ref` lorsque plusieurs rôles partagent un profil, un fournisseur ou des outils, ou qu’un composant mérite un nom stable. Les deux formes suivent les mêmes contrats de validation et d’exécution ; les composants nommés sont facultatifs.

## Ajouter un agent

Pour cet exemple local, le CLI Codex doit déjà être installé et authentifié sur l’hôte ; suivez le [guide Codex](../codex/). Enregistrez ces deux fichiers complets. Commandes et agents utilisent les permissions de votre machine.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: feature/welcome, from: main }
sandbox:
  provider: local
agents:
  writer:
    harness: codex
    authentication: account
```

La recette sélectionne le rôle `writer` configuré. Utilisez un dépôt Git dans `./project` avec une branche `main`. L’agent crée `welcome.md` sur une branche séparée. Le validateur YAML actuel refuse encore les harnesses CLI natifs dans les workspaces de fichiers, même lorsque l’API TypeScript annonce ces capacités ; utilisez le [harness Outpost](../recipe-harness/) pour une recette sans Git.

```yaml title="recipe.yaml"
version: 3
name: write-note
tasks:
  - key: draft
    agent: writer
    brief: Write a short welcome message in welcome.md, then summarize it.
```

Lancez `npx outpost recipe run --file recipe.yaml --config outpost.yaml --json` et consultez `outputs.draft.text`. La branche nommée est conservée sans intégration automatique. Choisissez explicitement l’[authentification](../authentication/) de chaque rôle CLI ; le choix du modèle est facultatif.

## Passer à Docker

Préparez l’image Codex avec le guide [images d’agents](../agent-images/), puis remplacez uniquement `sandbox` dans la configuration précédente. Gardez le workspace et le rôle d’agent.

```yaml title="outpost.yaml — sandbox"
sandbox:
  provider: docker
  image: outpost-codex:dev
```

Les autres fournisseurs proposent leurs [options de sandbox](../choose-a-sandbox/). Les capacités de workspace ou d’agent non prises en charge sont refusées. Un workspace de fichiers en conteneur exige une image explicite.

## Partager un profil

Ajoutez `profiles` et remplacez `agents` dans cette même configuration. Les profils partagent instructions, restrictions d’outils compatibles et déclarations MCP. Demander à un agent de ne pas modifier les fichiers ne lui impose pas un accès en lecture seule.

```yaml title="outpost.yaml — profiles"
profiles:
  writing:
    type: portable
    instructions: Write concise, plain-language documents.
agents:
  writer:
    harness: codex
    authentication: account
    profile: { $ref: profiles.writing }
```

Les hooks natifs des CLI et les callbacks de hooks des profils nécessitent des [extensions locales](../recipe-extensions/). Le [harness intégré](../recipe-harness/) possède ses propres déclarations d’outils, permissions et hooks.

## Sélectionner les variables d’environnement

Ajoutez ce bloc à la racine pour transmettre uniquement la variable hôte choisie. Gardez les valeurs secrètes hors des recettes et configurations. Les [sources de secrets](../secret-sources/) peuvent résoudre les noms sélectionnés via des composants déclarés et des clients hôtes.

```yaml title="outpost.yaml — environment"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

## Activer les suggestions de l’éditeur

Gardez l’en-tête correspondant au début de chaque fichier, suivi de son contenu existant. Ces URL suivent la documentation déployée. Pour figer les suggestions, utilisez `/outpost/schemas/<version-du-paquet>/recipe.schema.json` et `recipe-configuration.schema.json`, sans `v` ; les archives existent pour les releases contenant les deux schémas.

```yaml title="recipe.yaml — schema header"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
```

```yaml title="outpost.yaml — schema header"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 3
```

Hors ligne, utilisez un chemin relatif comme `./node_modules/@elie-laloum/outpost/recipe.schema.json`. `recipe init` écrit automatiquement les chemins des schémas installés. Versions de format YAML et versions du paquet sont indépendantes ; ces guides utilisent le format 3, les anciens restent pris en charge.

## Trouver le réglage suivant

| Besoin                                                    | Guide                                  |
| --------------------------------------------------------- | -------------------------------------- |
| Branches, copies, montages et publication                 | [Workspaces](../recipe-workspaces/)    |
| Fournisseurs de modèles, outils et réponses JSON validées | [Boucle d’agent](../recipe-harness/)   |
| Événements et rapports finaux                             | [Observation](../recipe-observation/)  |
| Composants nommés et options disponibles                  | [Composants YAML](../yaml-components/) |

<!-- Retained section anchors for existing bookmarks. -->

<span id="configurer-lexécution-une-fois"></span>
<span id="composer-les-composants-natifs-de-configuration"></span>
<span id="workspaces-de-fichiers"></span>
<span id="pour-aller-plus-loin"></span>
<span id="déclarer-lobservation-et-les-rapports-finaux"></span>
<span id="déclarer-les-rapports-et-la-télémétrie"></span>
<span id="sélectionner-les-secrets-avant-allocation"></span>
<span id="exécuter-le-harness-outpost-depuis-le-yaml"></span>
