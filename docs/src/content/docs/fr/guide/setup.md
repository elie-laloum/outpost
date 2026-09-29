---
title: "Installation"
description: "Générer un projet de workflow ou ajouter Outpost à votre application, avec Docker et un compte Codex."
---

Deux chemins sont possibles. Générez un projet de workflow avec `outpost init` pour voir un agent travailler en quelques minutes, ou installez le paquet dans votre propre application et écrivez sa configuration. Les deux utilisent Docker et un compte Codex ; consultez [Choisir un agent](../choose-an-agent/) et [Choisir une sandbox](../choose-a-sandbox/) pour les autres options.

## Prérequis

- Node.js 24 ou ultérieur.
- Un dépôt Git possédant au moins un commit.
- Docker ou Podman installé et démarré.

## Se connecter à Codex

Connectez-vous sur l’hôte avec la CLI Codex, en stockant les identifiants dans un fichier :

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copie `~/.codex/auth.json` (ou `$CODEX_HOME/auth.json`) dans le home privé de la sandbox, et l’agent utilise votre abonnement ChatGPT. Pour une clé API ou un autre agent, consultez [Authentification](../authentication/).

## Chemin A : générer un projet de workflow

Lancez `init` depuis votre dépôt et répondez aux questions, ou passez `--yes` pour accepter les valeurs par défaut (Codex, Docker, connexion par compte, npm) :

```sh
npx @elie-laloum/outpost init --image outpost:dev
npx @elie-laloum/outpost init --yes --install --image outpost:dev
```

`init` écrit ces fichiers et s’arrête plutôt que d’en écraser un qui existe déjà :

- `run.ts` : le script du workflow (`run.mts` quand `package.json` déclare `"type": "commonjs"`).
- `brief.md` : les instructions envoyées à l’agent, avec un emplacement `{{OBJECTIVE}}`.
- `.env.example` : les variables dont votre mode de connexion a besoin (aucune pour un compte Codex). Le script les lit dans `.env` ou dans l’environnement.
- `Dockerfile` (`Containerfile` avec Podman) : la recette de l’[image d’agent](../agent-images/).
- `.gitignore` : ignore `.env`, `node_modules/` et les répertoires d’exécution d’Outpost ; les règles sont ajoutées à un fichier existant.
- `package.json` : seulement si le répertoire n’en a pas.

Avec Docker ou Podman, `init` construit ensuite l’image ; le premier build télécharge les CLI des agents. Passez `--no-build` pour l’éviter. Sans `--install`, installez vous-même les dépendances (`npm install`). Utilisez `--directory` et `--repository` pour garder le workflow hors du checkout cible ; consultez [Commandes CLI](../cli/).

## Chemin B : utiliser Outpost dans votre application

Installez le paquet :

```sh
npm install @elie-laloum/outpost
```

La configuration ci-dessous utilise l’image `outpost:dev`. Si vous avez suivi le chemin A, elle existe déjà. Sinon, générez une recette dans un répertoire séparé et construisez-la :

```sh
npx outpost init --yes --directory outpost-image --image outpost:dev
```

Enregistrez ensuite la configuration à côté de vos scripts :

```ts title="outpost.config.mts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});

export const repository = process.env.OUTPOST_REPOSITORY ?? process.cwd();
```

`coder` est l’agent Codex connecté avec votre compte, `sandboxProvider` démarre un conteneur depuis `outpost:dev` pour chaque tâche, et `repository` est le checkout sur lequel l’agent travaille. Outpost ne charge pas ce fichier de lui-même : importez ces noms dans chaque script qui en a besoin. Définissez `OUTPOST_REPOSITORY` avec un chemin absolu quand vous lancez des scripts hors du dépôt cible.

## Vérifier l’installation

Avant le premier appel payant, vérifiez l’hôte, le moteur de conteneurs et l’image :

```sh
npx outpost doctor --image outpost:dev
```

`doctor` vérifie Docker et Codex par défaut ; choisissez-en d’autres avec `--sandbox-provider` et `--agent`, et ajoutez `--json` pour un rapport exploitable par une machine. Il se termine avec le statut 1 quand une vérification échoue. Il ne teste ni l’authentification ni l’accès au modèle. Consultez [Diagnostic](../diagnostics/).

## Lancer le projet généré

Dans un projet du chemin A, passez l’objectif en arguments :

```sh
node run.ts "Describe this repository"
```

Le script affiche sa progression sur stderr, puis la branche de travail, les commits de l’agent et sa conversation. Appuyez sur Ctrl+C pour annuler ; le script affiche alors les informations de récupération.

Le script généré utilise `branch: { mode: "integrate" }` : quand l’agent crée des commits, Outpost fusionne sa branche de travail dans la branche extraite de votre dépôt. Pour relire les modifications avant qu’elles n’arrivent, passez à une branche nommée dans `run.ts`, comme dans [Dépôt et branche](../repository-and-branch/).

## Étapes suivantes

Lancez votre propre tâche depuis TypeScript avec [Votre première tâche](../first-request/).

API : [createAgent](../../reference/createagent/) · [createCodexHarness](../../reference/createcodexharness/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
