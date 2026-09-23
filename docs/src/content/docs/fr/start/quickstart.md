---
title: "Premier lancement d’un agent"
description: "Premier lancement d’un agent — Outpost"
sidebar:
  order: 2
---

Ce guide utilise Codex et Docker. Placez-vous dans un dépôt Git contenant un commit, après avoir [installé Outpost](../installation/).

## 1. Générer les fichiers du projet

```sh
npx outpost init --yes --agent codex --provider docker --template blank --build
```

La commande crée `.outpost` avec un script de démarrage, une recette d’image et un exemple d’environnement, puis construit l’image. Elle refuse d’écraser une configuration existante. Remplacez `docker` par `podman`, ou `codex` par `claude`, selon votre choix.

## 2. Déclarer les identifiants de l’agent

Copiez `.outpost/.env.example` vers `.outpost/.env`. Déclarez `OPENAI_API_KEY` pour Codex. Pour Claude Code, déclarez `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN`.

```dotenv
OPENAI_API_KEY=
```

Une déclaration vide reprend la variable du processus. Une valeur non vide dans le fichier est prioritaire. Le `.env` à la racine du dépôt n’est pas lu. Ne versionnez pas les identifiants. La page [configuration de l’environnement](../../agents/environment/) explique les fichiers d’authentification natifs et les surcharges.

## 3. Exécuter le script

```sh
node .outpost/run.mts "Ajoute la validation des entrées, lance les tests et crée un commit"
```

Utilisez `run.ts` si votre package déclare `"type": "module"` : l’initialisation affiche la commande exacte. L’image contient les deux CLI d’agents, Git, Node et Python. Ajoutez les autres outils du projet dans la recette si nécessaire.

## 4. Examiner le résultat

Vérifiez l’état et l’historique Git, les commits retournés et les logs dans `.outpost/logs`. Un dispatch collecte les changements de l’agent ; la politique de branche détermine si les commits restent séparés ou sont intégrés à la branche de l’hôte. Il ne pousse pas votre dépôt vers un serveur distant.

Pour contrôler le cycle de vie, consultez [le dispatch ponctuel](../../agents/dispatch/) et [les politiques de branche](../../sandboxes/branches/). Pour automatiser plusieurs étapes, poursuivez avec [les workflows](../../workflows/graph/).
