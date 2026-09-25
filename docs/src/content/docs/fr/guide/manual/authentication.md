---
title: Authentification
description: Accès aux agents, emplacement des identifiants et accès cloud indépendant.
---

Choisissez explicitement l’authentification avec `outpost init --agent … --authentication …`. Le script généré prépare la méthode choisie ; construire un adapter seul ne connecte pas l’agent. Commencez par le [premier lancement complet](../../start/quickstart/) ou consultez le [contrat CLI](../cli/).

| Agent  | Authentification CLI | Identifiant                                                      | Préparation dans la sandbox                                                   |
| ------ | -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Codex  | `api-key`            | `OPENAI_API_KEY` déclarée dans le `.env` du workflow             | Le hook généré transmet la clé sur stdin.                                     |
| Codex  | `login`              | Fichier hôte `$CODEX_HOME/auth.json`, sinon `~/.codex/auth.json` | Copie explicite dans le home privé de la sandbox ; aucun export du trousseau. |
| Claude | `api-key`            | `ANTHROPIC_API_KEY` déclarée dans le `.env` du workflow          | Variable d’environnement explicite.                                           |
| Claude | `oauth-token`        | `CLAUDE_CODE_OAUTH_TOKEN` obtenu avec `claude setup-token`       | Variable d’environnement explicite.                                           |
| Gemini | `api-key`            | `GEMINI_API_KEY` déclarée dans le `.env` du workflow             | Variable d’environnement explicite ; sessions neuves uniquement.              |

Pour préparer un compte Codex, lancez d’abord `codex -c cli_auth_credentials_store='"file"' login` sur l’hôte. Cette commande choisit délibérément le stockage fichier. Ce fichier est sensible : gardez-le hors de Git et ne l’affichez pas. Accès par compte et facturation par clé API sont distincts. Les exemples rejettent les identifiants Claude concurrents et la combinaison compte Codex/clé API.

Le `.env` du workflow se trouve à côté du script généré. Une déclaration vide hérite de la variable hôte correspondante ; les secrets hôtes non déclarés ne sont pas transmis. Les valeurs par défaut de la bibliothèque lisent plutôt `.outpost/.env` dans le dépôt. Voir la [priorité des configurations](../configuration/). Le home privé de la sandbox est éphémère ; conserver une conversation ne conserve pas l’authentification.

## L’allocation cloud utilise un accès séparé

Les identifiants Vercel et Daytona autorisent l’allocation de sandbox, indépendamment des identifiants de l’agent choisi. Utilisez les réglages de connexion ou variables d’environnement déclarés par le provider ; n’ajoutez pas les secrets d’allocation aux variables de l’agent sauf s’il en a effectivement besoin. La [recette distante](../../cookbook/remote/) fournit toute la préparation SDK et environnement.

## Diagnostiquer une connexion en échec

Un contrôle `doctor` ou une allocation réussie ne prouve pas qu’un modèle accepte les identifiants. Vérifiez la méthode choisie, la variable déclarée, l’accès abonnement/API et l’emplacement du fichier Codex avant de réessayer. Un programme écrit directement avec l’API configure explicitement l’authentification ; le script Codex généré par la CLI contient déjà son hook de connexion.

Contrats détaillés et exemples exécutables : [Codex](../../agents/connect-codex/), [Claude](../../agents/connect-claude/), [Gemini](../../agents/gemini/). Les providers de modèle Codex personnalisés nécessitent un endpoint compatible Responses ; voir le [contrat du provider](../../behavior/agents/connect-codex/#fournisseurs-de-modèles-compatibles-openai).

Sources fournisseurs : [authentification Codex](https://developers.openai.com/codex/auth/), [authentification Claude](https://code.claude.com/docs/en/authentication), [référence CLI Claude](https://code.claude.com/docs/en/cli-reference).
