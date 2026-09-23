---
title: "Environnement et authentification"
description: "Environnement et authentification — Outpost"
sidebar:
  order: 3
---

Outpost lit **uniquement `.outpost/.env`** comme fichier d’environnement du projet. Il n’importe pas le `.env` à la racine du dépôt.

```dotenv
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GH_TOKEN=
PROJECT_MODE=test
```

## Priorité des valeurs

1. Une valeur non vide de `.outpost/.env` est utilisée directement.
2. Une déclaration vide reprend la variable correspondante du processus hôte, si elle existe.
3. Les `variables` explicites du provider ou de l’adapter surchargent ces valeurs.

Le provider et l’adapter ne peuvent pas déclarer le même nom. Placez l’environnement partagé dans le provider et les identifiants spécifiques dans l’adapter. Une sandbox active résout les variables de l’adapter à chaque tâche. Les environnements isolés n’importent que les variables déclarées ; `local()` utilise votre processus hôte et n’isole pas l’environnement.

## Choisir l’authentification

Utilisez `OPENAI_API_KEY` pour Codex, et `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN` pour Claude Code. Pour l’authentification native, montez explicitement le fichier ou répertoire requis dans le home de l’agent. Préférez la lecture seule lorsque le CLI la supporte. Ne montez pas tout votre home pour fournir un seul identifiant.

Les opérations GitHub utilisent `gh` sur l’hôte : authentifiez-le ou déclarez `GH_TOKEN`. Les identifiants Vercel/Daytona servent à allouer la sandbox, indépendamment des appels au modèle. Une connexion au provider réussie ne prouve pas que l’agent est authentifié.

Les valeurs d’environnement sont des chaînes. Évitez les secrets dans les arguments de commande, les sources et les modèles de prompt. Les `.env.example` générés listent les noms, jamais de vrais secrets. Les logs et transcripts peuvent néanmoins contenir les données sensibles produites par votre tâche.

Voir [les montages](../../providers/containers/) et [les limites de sécurité](../../operations/security/).

## Connecter un compte

Suivez la [connexion Claude Code](../connect-claude/) ou la [connexion Codex](../connect-codex/) pour les abonnements, clés API et conteneurs. Déclarer OPENAI_API_KEY ne crée pas à lui seul une connexion Codex ; utilisez le hook documenté.
