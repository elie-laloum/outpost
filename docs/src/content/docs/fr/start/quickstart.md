---
title: "Premier lancement d’un agent"
description: "Premier lancement d’un agent — Outpost"
sidebar:
  order: 2
---

Ce guide utilise Codex et Docker. Choisissez un dépôt Git contenant un commit. Le workflow sera créé dans un dossier séparé ; consultez aussi [l’installation](../installation/).

## 1. Générer les fichiers du projet

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install --build
```

La commande crée `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` et une recette d’image directement dans `workflow1`, installe les dépendances puis construit l’image. Elle refuse d’écraser une configuration existante. Remplacez `docker` par `podman`, ou `codex` par `claude`, selon votre choix.

## 2. Déclarer les identifiants de l’agent

Copiez `.env.example` vers `.env`. Déclarez `OPENAI_API_KEY` pour Codex. Pour Claude Code, déclarez `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN`.

```dotenv
OPENAI_API_KEY=
```

Une déclaration vide reprend la variable du processus. Une valeur non vide dans le fichier est prioritaire. Le script lit le `.env` du dossier du workflow et transmet ses déclarations au provider. Ne versionnez pas les identifiants. La page [configuration de l’environnement](../../agents/environment/) explique les fichiers d’authentification natifs et les surcharges.

## 3. Exécuter le script

```sh
node run.ts "Ajoute la validation des entrées, lance les tests et crée un commit"
```

Le script utilise TypeScript, exécuté directement par Node.js 24+. Pour un projet existant déclarant `"type": "commonjs"`, le fichier généré est `run.mts` ; utilisez la commande affichée par `init`. L’image contient les deux CLI d’agents, Git, Node et Python. Ajoutez les autres outils du projet dans la recette si nécessaire.

## 4. Examiner le résultat

Vérifiez l’état et l’historique Git, les commits retournés et les logs dans `.outpost/logs` du dépôt ciblé. Un dispatch collecte les changements de l’agent ; la politique de branche détermine si les commits restent séparés ou sont intégrés à la branche de l’hôte. Il ne pousse pas votre dépôt vers un serveur distant.

Pour contrôler le cycle de vie, consultez [le dispatch ponctuel](../../agents/dispatch/) et [les politiques de branche](../../sandboxes/branches/). Pour automatiser plusieurs étapes, poursuivez avec [les workflows](../../workflows/graph/).

Pour un accès par compte, suivez [Connecter Codex](../../agents/connect-codex/) ou [Connecter Claude](../../agents/connect-claude/). Avec une clé API Codex, ajoutez le hook de connexion du guide au script généré avant le dispatch.

Consultez [choisir un dépôt](../../sandboxes/repositories/) pour distinguer le dossier du workflow, le dépôt ciblé et les chemins relatifs.
