---
title: "Initialiser un projet"
description: "Initialiser un projet — Outpost"
sidebar:
  order: 4
---

`outpost init` crée un projet de workflow dans le dossier courant ou celui indiqué par `--directory`. Ce dossier peut être indépendant des dépôts Git ciblés. Le mode interactif demande les choix ; en automatisation, passez `--yes` ou tous les choix requis.

```sh
npx @elie-laloum/outpost init --yes --agent claude --provider podman --repository /path1/repository --install
```

| Option         | Valeurs / comportement                                                            |
| -------------- | --------------------------------------------------------------------------------- |
| `--yes`, `-y`  | Accepter les défauts sans question.                                               |
| `--agent`      | `codex` (défaut), `claude` ou `gemini`.                                           |
| `--provider`   | `docker` (défaut), `podman`, `local`, `vercel`, `daytona`.                        |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun` ; sinon détection via métadonnées/lockfiles.         |
| `--model`      | Nom du modèle inscrit dans l’adapter généré.                                      |
| `--install`    | Installer Outpost et le SDK optionnel sélectionné.                                |
| `--build`      | Construire l’image (automatique pour Docker/Podman).                              |
| `--image`      | Remplacer le nom d’image généré.                                                  |
| `--directory`  | Répertoire du workflow, courant par défaut.                                       |
| `--repository` | Dépôt Git ciblé ; chemin relatif au dossier du workflow, ou absolu. Défaut : `.`. |
| `--help`, `-h` | Afficher l’aide.                                                                  |

L’initialisation crée `run.ts`, `brief.md`, `.env.example`, `.gitignore`, un `package.json` et les fichiers spécifiques au provider directement dans ce dossier. Le manifeste contient un script `start`, Outpost et le SDK cloud éventuel ; `--install` installe ces dépendances. Un `package.json` existant est conservé et les règles manquantes sont ajoutées au `.gitignore`. Tout conflit avec les autres fichiers générés fait échouer l’initialisation avant écriture.

Le script est `run.ts` par défaut. Si un manifeste existant déclare `"type": "commonjs"`, `init` génère `run.mts` pour conserver la compatibilité ESM sans modifier ce manifeste. Node.js 24+ exécute directement ces fichiers TypeScript.

## Script généré

Le script lance un `dispatch` avec l’objectif fourni en ligne de commande. Modifiez `brief.md` pour adapter le prompt et `run.ts` pour configurer les options. Copiez `.env.example` vers `.env` dans le dossier du workflow : le script transmet les variables déclarées au provider. Une déclaration vide reprend la variable du processus.

Le dépôt, le brief et le `.env` sont résolus depuis le dossier du script, indépendamment du répertoire de lancement. Avec `--directory /path2/workflow1`, lancez `node /path2/workflow1/run.ts "Mon objectif"`, ou placez-vous dans ce dossier puis lancez `npm start -- "Mon objectif"` après installation.

Le dossier du workflow n’a pas besoin d’être un dépôt Git. Le dépôt ciblé doit contenir un commit. Les worktrees, verrous et logs restent dans `.outpost` du dépôt ciblé. Pour plusieurs dépôts, composez des tâches avec leurs propres `repository` : voir [les workflows multi-dépôts](../../workflows/sandbox-tasks/#plusieurs-dépôts).

Consultez [choisir un dépôt](../../../../guide/environment/repositories/) pour distinguer le dossier du workflow, le dépôt ciblé et les chemins relatifs.

Utilisez `outpost <commande> --help` pour les options de chaque commande. L’initialisation interactive propose des listes de choix ; Ctrl+C annule avant l’écriture des fichiers. Les rapports JSON et les commandes sans terminal conservent une sortie sans décoration.

## Authentification et prérequis

Le parcours interactif demande l’agent, le provider, le gestionnaire de paquets et le mode d’authentification. `--manager` remplace la détection par manifeste et lockfile. Avec `--install`, un gestionnaire absent fait échouer l’opération avant toute écriture ; installez-le ou sélectionnez explicitement un autre gestionnaire disponible. Sans `--install`, installez les dépendances générées avant de lancer le workflow.

`--authentication api-key` est le défaut : définissez `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou `GEMINI_API_KEY` selon l’agent. Le script vérifie le credential avant l’allocation, le transmet explicitement et prépare la connexion Codex par stdin dans le sandbox. La facturation API est distincte des abonnements. Le credential sélectionné peut provenir directement du processus parent même sans `.env` ; les autres variables doivent être déclarées dans `.env`.

Pour un abonnement Claude, choisissez `--authentication oauth-token`, lancez `claude setup-token` sur l’hôte et fournissez `CLAUDE_CODE_OAUTH_TOKEN` au workflow. Retirez `ANTHROPIC_API_KEY` de cet environnement. Une connexion navigateur sur l’hôte ne connecte pas Claude dans Vercel ou Daytona. Voir [l’authentification Claude](../../../../guide/agents/connect-claude/).

Pour une session de compte Codex, choisissez `--authentication login` et lancez `codex login` sur l’hôte. L’exécution locale utilise cette session. Les providers isolés reçoivent une copie privée du fichier `CODEX_HOME/auth.json` de l’hôte (`~/.codex/auth.json` par défaut) dans leur home éphémère. Le stockage des credentials doit être configuré sur fichier ; le trousseau système n’est pas exporté. Les renouvellements dans le sandbox ne mettent pas à jour la copie hôte. Voir [l’authentification Codex](../../../../guide/agents/connect-codex/).

Les images Docker/Podman sont construites automatiquement. Utilisez `--no-build` pour générer uniquement les fichiers, puis `outpost image build --engine docker --directory <workflow>` (ou `podman`) lorsque vous êtes prêt. Le moteur et son daemon doivent être disponibles. Si l’installation ou le build échoue après la génération, conservez les fichiers et relancez la commande d’installation/build concernée ; ne relancez pas init sur ces fichiers. Les credentials d’allocation cloud restent sur l’hôte et sont distincts des credentials des modèles.

## Endpoint modèle personnalisé

Pour un modèle Codex servi par une API compatible OpenAI Responses :

```sh
npx @elie-laloum/outpost init --yes --agent codex --provider docker --model vendor/model --base-url https://models.example.com/v1 --api-key-env MODEL_API_KEY --install
```

Définissez `MODEL_API_KEY` dans le processus parent ou le `.env` du workflow avant son lancement. `--api-key-env` vaut `OPENAI_API_KEY` par défaut et nécessite `--base-url` ; l’endpoint personnalisé nécessite `--model`. Ce parcours utilise directement le fournisseur personnalisé sans connexion à un compte OpenAI. Les endpoints limités à Chat Completions ne sont pas pris en charge. Voir [les fournisseurs personnalisés](../../agents/connect-codex/#fournisseurs-de-modèles-compatibles-openai).
