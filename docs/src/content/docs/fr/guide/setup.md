---
title: "Mise en place"
description: "Installer Outpost et configurer votre premier agent."
---

Utilisez Node.js 24 ou ultérieur et un dépôt Git possédant au moins un commit. Cette configuration utilise Docker et un compte Codex. Choisissez un autre [harness CLI](../choose-an-agent/) ou [environnement d’exécution](../choose-a-sandbox/) si nécessaire.

## Installer

```sh
npm install @elie-laloum/outpost
```

## Préparer l’image

Démarrez Docker, puis générez les fichiers du workflow et construisez l’image depuis votre dépôt :

```sh
npx outpost init --yes --image outpost:dev --install
```

Le premier build télécharge les outils CLI. `--no-build` permet de le sauter si l’image existe déjà. Les manifestes de paquet existants sont conservés.

## Se connecter

Connectez-vous sur l’hôte avec la CLI Codex en choisissant le stockage des identifiants dans un fichier :

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copie la connexion dans le home privé de la sandbox. Il ne lit jamais un trousseau système. Pour une clé API, utilisez la [configuration d’authentification API](../authentication/).

## Créer la configuration

Enregistrez ce fichier à côté du script de workflow. Définissez `OUTPOST_REPOSITORY` avec le chemin absolu du checkout si vous travaillez en dehors du dépôt cible.

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

Ce fichier est du code applicatif ordinaire. Outpost ne le découvre pas automatiquement : importez ses réglages dans les scripts qui en ont besoin.

## Envoyer une requête

Poursuivez avec [Première requête](../first-request/). Pour utiliser immédiatement le projet généré par la CLI, lancez `node run.ts "Décris ce dépôt"` (`run.mts` dans un projet explicitement CommonJS).

API : [createAgent](../../reference/createagent/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
