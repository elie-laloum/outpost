---
title: "Premier lancement d’un agent"
description: "Premier lancement d’un agent — Outpost"
sidebar:
  order: 2
---

Ce guide utilise Codex et Docker. Choisissez un dépôt Git contenant un commit. Le workflow sera créé dans un dossier séparé ; consultez aussi [l’installation](../../../start/installation/).

## 1. Générer les fichiers du projet

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install --build
```

La commande crée `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` et une recette d’image directement dans `workflow1`, installe les dépendances puis construit l’image. Elle refuse d’écraser une configuration existante. Avec `--yes`, les valeurs par défaut sont Codex, Docker et `--authentication account`. Pour Podman, ajoutez `--sandbox-provider podman`. Pour un autre agent, ajoutez `--agent claude`, `copilot`, `kimi` ou `antigravity`.

## 2. Déclarer les identifiants de l’agent

Avec l’authentification `account` par défaut, connectez-vous d’abord sur l’hôte ; pour Codex, lancez `codex -c cli_auth_credentials_store='"file"' login`. Aucune variable n’est nécessaire : Outpost copie cette connexion dans le home privé de la sandbox avant la première exécution.

Pour facturer plutôt une clé API, initialisez avec `--authentication usage`, copiez `.env.example` vers `.env` et déclarez la variable indiquée, par exemple `OPENAI_API_KEY` pour Codex. Pour Claude Code, `--authentication account-token` déclare `CLAUDE_CODE_OAUTH_TOKEN` et `usage` déclare `ANTHROPIC_API_KEY`.

```dotenv
OPENAI_API_KEY=
```

Une déclaration vide reprend la variable du processus. Une valeur non vide dans le fichier est prioritaire. Le script lit le `.env` du dossier du workflow et transmet ses déclarations au provider. Ne versionnez pas les identifiants. Le [manuel d’authentification](../../../manual/authentication/) détaille chaque forme et la page [configuration de l’environnement](../../../agents/environment/) explique les surcharges.

## 3. Exécuter le script

```sh
node run.ts "Ajoute la validation des entrées, lance les tests et crée un commit"
```

Le script utilise TypeScript, exécuté directement par Node.js 24+. Pour un projet existant déclarant `"type": "commonjs"`, le fichier généré est `run.mts` ; utilisez la commande affichée par `init`. L’image contient les CLI Claude Code, Codex, GitHub Copilot, Kimi Code et Antigravity (`agy`), Git, Node et Python. Ajoutez les autres outils du projet dans la recette si nécessaire.

## 4. Examiner le résultat

Vérifiez l’état et l’historique Git, les commits retournés et les logs dans `.outpost/logs` du dépôt ciblé. Un dispatch collecte les changements de l’agent ; la politique de branche détermine si les commits restent séparés ou sont intégrés à la branche de l’hôte. Il ne pousse pas votre dépôt vers un serveur distant.

Pour contrôler le cycle de vie, consultez [le dispatch ponctuel](../../../agents/dispatch/) et [les politiques de branche](../../../environment/branches/). Pour automatiser plusieurs étapes, poursuivez avec [les workflows](../../../workflows/graph/).

Pour le détail de l’accès par compte, suivez [Connecter Codex](../../../agents/connect-codex/) ou [Connecter Claude](../../../agents/connect-claude/). Le harness généré choisit déjà sa forme d’`authentication` ; une composition manuelle avec l’API doit en choisir une explicitement, sinon Outpost ne prépare aucun identifiant.

Consultez [choisir un dépôt](../../../environment/repositories/) pour distinguer le dossier du workflow, le dépôt ciblé et les chemins relatifs.
