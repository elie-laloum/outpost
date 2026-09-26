---
title: "Initialiser un projet"
description: "Initialiser un projet — Outpost"
sidebar:
  order: 4
---

`outpost init` crée un projet de workflow dans le dossier courant ou celui indiqué par `--directory`. Ce dossier peut être indépendant des dépôts Git ciblés. Le mode interactif demande les choix ; en automatisation, passez `--yes` ou tous les choix requis.

```sh
npx @elie-laloum/outpost init --yes --agent claude --sandbox-provider podman --repository /path1/repository --install
```

| Option               | Valeurs / comportement                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| `--yes`, `-y`        | Accepter les défauts sans question.                                               |
| `--agent`            | `codex` (défaut), `claude`, `antigravity`, `copilot` ou `kimi`.                   |
| `--authentication`   | `account` (défaut), `account-token` (Claude, Copilot) ou `usage`.                 |
| `--sandbox-provider` | `docker` (défaut), `podman`, `local`, `vercel`, `daytona`.                        |
| `--manager`          | `npm`, `pnpm`, `yarn`, `bun` ; sinon détection via métadonnées/lockfiles.         |
| `--model`            | Nom du modèle inscrit dans l’adapter généré.                                      |
| `--install`          | Installer Outpost et le SDK optionnel sélectionné.                                |
| `--build`            | Construire l’image (automatique pour Docker/Podman).                              |
| `--image`            | Remplacer le nom d’image généré.                                                  |
| `--directory`        | Répertoire du workflow, courant par défaut.                                       |
| `--repository`       | Dépôt Git ciblé ; chemin relatif au dossier du workflow, ou absolu. Défaut : `.`. |
| `--help`, `-h`       | Afficher l’aide.                                                                  |

L’initialisation crée `run.ts`, `brief.md`, `.env.example`, `.gitignore`, un `package.json` et les fichiers spécifiques au provider directement dans ce dossier. Le manifeste contient un script `start`, Outpost et le SDK cloud éventuel ; `--install` installe ces dépendances. Un `package.json` existant est conservé et les règles manquantes sont ajoutées au `.gitignore`. Tout conflit avec les autres fichiers générés fait échouer l’initialisation avant écriture.

Le script est `run.ts` par défaut. Si un manifeste existant déclare `"type": "commonjs"`, `init` génère `run.mts` pour conserver la compatibilité ESM sans modifier ce manifeste. Node.js 24+ exécute directement ces fichiers TypeScript.

## Script généré

Le script lance un `dispatch` avec l’objectif fourni en ligne de commande. Modifiez `brief.md` pour adapter le prompt et `run.ts` pour configurer les options. Copiez `.env.example` vers `.env` dans le dossier du workflow : le script transmet les variables déclarées au provider. Une déclaration vide reprend la variable du processus.

Le dépôt, le brief et le `.env` sont résolus depuis le dossier du script, indépendamment du répertoire de lancement. Avec `--directory /path2/workflow1`, lancez `node /path2/workflow1/run.ts "Mon objectif"`, ou placez-vous dans ce dossier puis lancez `npm start -- "Mon objectif"` après installation.

Le dossier du workflow n’a pas besoin d’être un dépôt Git. Le dépôt ciblé doit contenir un commit. Les worktrees, verrous et logs restent dans `.outpost` du dépôt ciblé. Pour plusieurs dépôts, composez des tâches avec leurs propres `repository` : voir [les workflows multi-dépôts](../../behavior/workflows/sandbox-tasks/#plusieurs-dépôts).

Consultez [choisir un dépôt](../../environment/repositories/) pour distinguer le dossier du workflow, le dépôt ciblé et les chemins relatifs.

Utilisez `outpost <commande> --help` pour les options de chaque commande. L’initialisation interactive propose des listes de choix ; Ctrl+C annule avant l’écriture des fichiers. Les rapports JSON et les commandes sans terminal conservent une sortie sans décoration.

## Authentification et prérequis

Le parcours interactif demande l’agent, le provider, le gestionnaire de paquets et le mode d’authentification. `--manager` remplace la détection par manifeste et lockfile. Avec `--install`, un gestionnaire absent fait échouer l’opération avant toute écriture ; installez-le ou sélectionnez explicitement un autre gestionnaire disponible. Sans `--install`, installez les dépendances générées avant de lancer le workflow.

`--authentication` choisit l’identifiant inscrit dans le harness généré. `account` est la valeur par défaut, ou `usage` avec `--base-url` :

| Agent         | `account`                                           | `account-token`           | `usage`                          |
| ------------- | --------------------------------------------------- | ------------------------- | -------------------------------- |
| `codex`       | Connexion ChatGPT de `auth.json`                    | Non pris en charge        | `OPENAI_API_KEY`                 |
| `claude`      | Entrée d’abonnement de `.credentials.json`          | `CLAUDE_CODE_OAUTH_TOKEN` | `ANTHROPIC_API_KEY`              |
| `antigravity` | Fichier de jeton de la connexion Google             | Non pris en charge        | `GEMINI_API_KEY`                 |
| `copilot`     | Jeton enregistré dans `config.json`                 | `COPILOT_GITHUB_TOKEN`    | Non pris en charge               |
| `kimi`        | Profil Kimi Code, puis `kimi login` dans la sandbox | Non pris en charge        | `KIMI_API_KEY` ; exige `--model` |

Connectez-vous sur l’hôte avant de lancer un workflow `account`, avec un stockage fichier lorsque la CLI propose un trousseau ; Outpost ne lit jamais de trousseau système. Pour Claude sur macOS, choisissez `account-token` et lancez `claude setup-token`. Le `run.ts` généré contient seulement la forme choisie, par exemple `authentication: "account"`, et ne lit lui-même aucun fichier d’identifiants : Outpost prépare l’identifiant dans le home privé de la sandbox avant le premier dispatch. Avec `--sandbox-provider local`, aucun fichier n’est copié et la CLI utilise sa propre connexion sur l’hôte.

`.env.example` déclare la variable de la forme choisie, et aucune pour `account`. Le script déclare aussi cette variable : une valeur dans le processus parent suffit même sans `.env` ; les autres variables doivent être déclarées dans `.env`. La facturation API est distincte des abonnements, et Claude rejette une clé API déclarée à côté d’un identifiant d’abonnement. Une combinaison non prise en charge, comme `--agent codex --authentication account-token` ou Kimi en `usage` sans `--model`, échoue avant toute écriture. Voir le [manuel d’authentification](../authentication/) et les guides [Codex](../../agents/connect-codex/), [Claude](../../agents/connect-claude/), [Antigravity](../../agents/connect-antigravity/), [Copilot](../../agents/connect-copilot/) et [Kimi Code](../../agents/connect-kimi/).

Les valeurs supprimées `--authentication api-key`, `oauth-token` et `login` correspondent à `usage`, `account-token` et `account`.

Les images Docker/Podman sont construites automatiquement et contiennent les CLI Claude Code, Codex, GitHub Copilot, Kimi Code et Antigravity (`agy`). Utilisez `--no-build` pour générer uniquement les fichiers, puis `outpost image build --engine docker --directory <workflow>` (ou `podman`) lorsque vous êtes prêt. Le moteur et son daemon doivent être disponibles. Si l’installation ou le build échoue après la génération, conservez les fichiers et relancez la commande d’installation/build concernée ; ne relancez pas init sur ces fichiers. Les credentials d’allocation cloud restent sur l’hôte et sont distincts des credentials des modèles.

## Endpoint modèle personnalisé

Pour un modèle Codex servi par une API compatible OpenAI Responses :

```sh
npx @elie-laloum/outpost init --yes --agent codex --sandbox-provider docker --model vendor/model --base-url https://models.example.com/v1 --api-key-env MODEL_API_KEY --install
```

Définissez `MODEL_API_KEY` dans le processus parent ou le `.env` du workflow avant son lancement. `--api-key-env` vaut `OPENAI_API_KEY` par défaut et nécessite `--base-url` ; l’endpoint personnalisé nécessite `--model`. Ce parcours utilise directement le fournisseur personnalisé sans connexion à un compte OpenAI : le harness généré choisit `authentication: "usage"`, qui lit cette variable. Les endpoints limités à Chat Completions ne sont pas pris en charge. Voir [les fournisseurs personnalisés](../../behavior/agents/connect-codex/#fournisseurs-de-modèles-compatibles-openai).
