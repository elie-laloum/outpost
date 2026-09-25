---
title: "Environnement et authentification"
description: "Environnement et authentification — Outpost"
sidebar:
  order: 3
---

L’API Outpost charge automatiquement `.outpost/.env` dans le **dépôt ciblé**. Elle n’importe pas le `.env` à la racine du dépôt.

Le script `run.ts` généré par `init` lit explicitement le `.env` placé **à côté du script**, puis transmet ses déclarations au provider via `variables`. Ces valeurs sont prioritaires sur celles du dépôt. Les déclarations vides reprennent les variables du processus. Cela permet de conserver les identifiants dans un dossier de workflow indépendant.

```dotenv
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PROJECT_MODE=test
```

## Priorité des valeurs

1. Une valeur non vide de `.outpost/.env` est utilisée directement.
2. Une déclaration vide reprend la variable correspondante du processus hôte, si elle existe.
3. Les `variables` explicites du provider ou de l’adapter surchargent ces valeurs.

Le provider et l’adapter ne peuvent pas déclarer le même nom. Placez l’environnement partagé dans le provider et les identifiants spécifiques dans l’adapter. Une sandbox active résout les variables de l’adapter à chaque tâche. Les environnements isolés n’importent que les variables déclarées ; `localSandboxProvider()` utilise votre processus hôte et n’isole pas l’environnement.

## Choisir l’authentification

Utilisez `OPENAI_API_KEY` pour Codex, et `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN` pour Claude Code. Pour l’authentification native, montez explicitement le fichier ou répertoire requis dans le home de l’agent. Préférez la lecture seule lorsque le CLI la supporte. Ne montez pas tout votre home pour fournir un seul identifiant.

Les identifiants Vercel/Daytona servent à allouer la sandbox, indépendamment des appels au modèle. Une connexion au provider réussie ne prouve pas que l’agent est authentifié.

Les valeurs d’environnement sont des chaînes. Évitez les secrets dans les arguments de commande, les sources et les modèles de prompt. Les `.env.example` générés listent les noms, jamais de vrais secrets. Les logs et transcripts peuvent néanmoins contenir les données sensibles produites par votre tâche.

Voir [les montages](../../../environment/providers/containers/) et [les limites de sécurité](../../../operations/security/).

## Connecter un compte

Suivez la [connexion Claude Code](../../../agents/connect-claude/) ou la [connexion Codex](../../../agents/connect-codex/) pour les abonnements, clés API et conteneurs. Déclarer OPENAI_API_KEY ne crée pas à lui seul une connexion Codex ; utilisez le hook documenté.
