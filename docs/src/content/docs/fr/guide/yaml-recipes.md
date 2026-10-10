---
title: "Votre première recette YAML"
description: "Exécuter une commande et un agent depuis deux fichiers YAML locaux."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="créer-une-recette"></span>
<span id="déclarer-les-paramètres-et-les-étapes"></span>
<span id="exécuter-et-inspecter-le-résultat"></span>

## Relire un README depuis YAML

Ce tutoriel exécute une commande, puis demande à un agent de relire votre README. Suivez [Installation](../setup/) pour préparer Outpost, l’image `outpost:dev` et l’accès au compte Codex. Le dépôt Git doit contenir un README commité.

Enregistrez les deux fichiers suivants dans le dépôt. La recette décrit le travail partageable ; `outpost.yaml` choisit son exécution sur votre machine. Leurs champs `version` correspondent à deux formats différents et peuvent donc différer.

## Déclarer les deux étapes

La commande vérifie Node.js dans la sandbox. L’agent démarre uniquement après sa réussite. Le sujet de la revue peut être choisi au lancement.

```yaml title="recipe.yaml"
version: 2
name: readme-review
inputs:
  focus:
    type: string
    description: What the review should focus on.
    default: setup instructions
tasks:
  - key: environment
    command:
      executable: node
      arguments: [-p, process.version]
  - key: review
    after: [environment]
    agent: coder
    brief: "Review the README {{ inputs.focus }}. Report findings without editing files."
```

## Choisir le dépôt et l’agent

La configuration utilise l’image construite pendant l’installation. `repository: .` est relatif au dossier du fichier de configuration. La branche nommée sépare le travail du dépôt courant ; choisissez un nouveau nom pour une revue indépendante.

```yaml title="outpost.yaml"
version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:dev
branch:
  mode: named
  name: outpost/recipe-review
agents:
  coder:
    harness: codex
    authentication: account
```

L’accès au compte est déclaré sur le harness. Pour une facturation API ou un autre environnement, consultez [Configurer l’exécution](../recipe-configuration/). Gardez les secrets dans la configuration locale, par nom de variable déclaré, jamais dans les paramètres de la recette partagée.

## Valider, lancer et examiner

Depuis le dossier des deux fichiers, validez les déclarations avant toute allocation, puis demandez un rapport JSON final :

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'focus=setup instructions' --json
```

La validation contrôle les déclarations et références ; elle ne teste pas les identifiants et n’exécute aucune commande. Le rapport contient la sortie de Node.js, la réponse de l’agent, la consommation et les informations du workspace. Il paraît après le nettoyage. Sans `--json` ni sorties configurées, une exécution réussie reste silencieuse.

Demander à l’agent de ne rien modifier ne restreint pas ses accès. Examinez la branche nommée si des changements ont été produits ; cette configuration ne l’intègre pas. Une commande échouée bloque les tâches dépendantes. Un échec ou une annulation conserve le travail pour la [récupération](../recovery/).

## Adapter la recette

- [Transmettre les résultats](../recipe-workflows/) : Utiliser paramètres, conditions et valeurs structurées.
- [Configurer l’exécution](../recipe-configuration/) : Choisir identifiants, fournisseurs, schémas d’éditeur et rapports.
- [Enregistrer et reprendre](../recipe-durability/) : Ajouter checkpoints et questions humaines.
- [Trouver une autre recette](../sharing-recipes/) : Examiner le travail téléchargé avant de l’exécuter.
- [Utiliser du TypeScript local](../recipe-extensions/) : Relier des fonctions de confiance ou appeler le moteur depuis le code.

La [référence CLI](../recipe-cli/#outpost-recipe-run) décrit les options et codes de sortie. [defineRecipe](../../reference/definerecipe/) décrit la déclaration compilée.

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
