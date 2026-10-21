---
title: "Votre première recette YAML"
description: "Exécuter deux commandes locales dans un workspace éphémère, sans Git, Docker ni compte d’agent."
---

Créez un fichier, puis lisez-le dans une seconde tâche. Il vous faut **Node.js 24+** et le paquet Outpost. Ce premier essai ne demande ni dépôt Git, ni image Docker, ni compte d’agent.

## 1. Installer le paquet

Installez Outpost dans un nouveau dossier. Enregistrez les deux fichiers YAML ci-dessous dans ce dossier.

```sh
npm install @elie-laloum/outpost
```

## 2. Décrire le travail

`recipe.yaml` contient les tâches. `after: [write]` fait attendre la seconde commande jusqu’à la fin de la première ; elles utilisent le même répertoire de travail.

```yaml title="recipe.yaml"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
name: hello-files
tasks:
  - key: write
    command:
      executable: node
      arguments:
        - -e
        - "require('node:fs').writeFileSync('hello.txt', 'Hello from Outpost!')"
  - key: read
    after: [write]
    command:
      executable: node
      arguments: [-p, "require('node:fs').readFileSync('hello.txt', 'utf8')"]
```

## 3. Choisir où l’exécuter

`outpost.yaml` sélectionne un workspace temporaire vide et une exécution locale. Les commandes s’exécutent sur votre machine avec vos permissions ; `local` ne fournit aucune isolation. `ephemeral` décrit les fichiers de travail, pas une protection de la machine.

```yaml title="outpost.yaml"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 3
workspace:
  kind: ephemeral
sandbox:
  provider: local
```

Utilisez la **version 3 dans les deux fichiers** pour suivre ces guides. Leurs versions désignent deux formats YAML distincts, pas la version du paquet installé. Les commentaires de schéma activent les suggestions dans les éditeurs équipés d’un serveur de langage YAML.

## 4. Exécuter et vérifier

Validez les fichiers, puis exécutez la recette avec un rapport final JSON. La validation ne lance aucune commande et n’alloue aucune sandbox.

Chaque étape déclare une seule opération. Si vous placez `agent` et `command` dans la même étape au format 3, la validation nomme les opérations incompatibles et indique la ligne et la colonne de l’étape. Séparez-les en deux étapes reliées par `after`.

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml
npx outpost recipe run --file recipe.yaml --config outpost.yaml --json
```

Dans le rapport, `outputs.read.stdout` contient `Hello from Outpost!`. Le workspace est temporaire : `hello.txt` n’est pas créé à côté des fichiers YAML. Sans `--json` ni rapport configuré, une exécution réussie reste silencieuse.

## Continuer

| Vous voulez…                                                          | Consultez…                                          |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| Conserver les fichiers, copier un dossier ou utiliser une branche Git | [Choisir un workspace](../recipe-workspaces/)       |
| Ajouter un agent ou passer à Docker                                   | [Configurer l’exécution](../recipe-configuration/)  |
| Transmettre des paramètres et des résultats                           | [Composer les étapes](../recipe-workflows/)         |
| Voir la progression et les résultats                                  | [Suivre une exécution](../recipe-observation/)      |
| Attendre une approbation puis reprendre                               | [Enregistrer la progression](../recipe-durability/) |

La [référence CLI des recettes](../recipe-cli/) décrit les commandes et leurs options.

<!-- Retained section anchors for existing bookmarks. -->

<span id="relire-un-readme-depuis-yaml"></span>
<span id="déclarer-les-deux-étapes"></span>
<span id="choisir-le-dépôt-et-lagent"></span>
<span id="valider-lancer-et-examiner"></span>
<span id="adapter-la-recette"></span>
<span id="créer-une-recette"></span>
<span id="déclarer-les-paramètres-et-les-étapes"></span>
<span id="exécuter-et-inspecter-le-résultat"></span>
<span id="activer-les-suggestions-de-léditeur"></span>
<span id="configurer-lexécution-une-fois"></span>
<span id="déclarer-lobservation-et-les-rapports-finaux"></span>
<span id="composer-les-composants-natifs-de-configuration"></span>
<span id="sélectionner-les-secrets-avant-allocation"></span>
<span id="exécuter-le-harness-outpost-depuis-le-yaml"></span>
<span id="workspaces-de-fichiers"></span>
<span id="réutiliser-le-résultat-dune-étape"></span>
<span id="utiliser-le-moteur-en-typescript"></span>
<span id="réutiliser-des-objets-observateurs-locaux"></span>
<span id="brancher-des-callbacks-typés-locaux"></span>
<span id="trouver-et-télécharger-des-recettes"></span>
<span id="contribuer-et-tester-une-recette"></span>
