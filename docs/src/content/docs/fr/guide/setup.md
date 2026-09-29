---
title: "Installation"
description: "Générer un projet de workflow prêt à lancer (chemin A) ou ajouter Outpost à votre application (chemin B), tous deux avec Docker et un compte Codex."
---

## Prérequis

Autres agents et sandboxes : [Choisir un agent](../choose-an-agent/), [Choisir une sandbox](../choose-a-sandbox/).

<!-- features -->

- **Node.js 24+** : Exécute Outpost et vos scripts.
- **Un dépôt Git** : Avec au moins un commit.
- **Docker ou Podman** : Installé et démarré.

## Se connecter à Codex

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copie `~/.codex/auth.json` (ou `$CODEX_HOME/auth.json`) dans le home privé de la sandbox : l’agent utilise ainsi votre abonnement ChatGPT. Clés API et autres agents : [Authentification](../authentication/).

## Chemin A : générer un projet de workflow

Lancez `init` dans votre dépôt. `--yes` accepte les valeurs par défaut : Codex, Docker, connexion par compte, npm.

```sh
npx @elie-laloum/outpost init --image outpost:dev
npx @elie-laloum/outpost init --yes --install --image outpost:dev
```

`init` écrit ces fichiers, puis construit l’image. Si l’un d’eux existe déjà, il s’arrête sans rien écrire.

<!-- files -->

- `run.ts` : Le script du workflow (`run.mts` si `package.json` déclare `"type": "commonjs"`).
- `brief.md` : Les instructions de l’agent, avec un emplacement `{{OBJECTIVE}}`.
- `.env.example` : Les variables de votre connexion, aucune pour un compte Codex.
- `Dockerfile` : La recette de l’[image d’agent](../agent-images/) (`Containerfile` pour Podman).
- `.gitignore` : Ignore `.env`, `node_modules/` et les répertoires d’exécution ; complète un fichier existant.
- `package.json` : Seulement si le répertoire n’en a pas.

`--no-build` évite le premier build, qui télécharge les CLI des agents. Sans `--install`, lancez `npm install`. `--directory` et `--repository` gardent le workflow hors du checkout ([Commandes CLI](../cli/)).

## Chemin B : utiliser Outpost dans votre application

```sh
npm install @elie-laloum/outpost
```

Le chemin A a déjà construit `outpost:dev`. Sinon, générez sa recette dans un répertoire séparé :

```sh
npx outpost init --yes --directory outpost-image --image outpost:dev
```

Enregistrez cette configuration à côté de vos scripts. Outpost ne la charge pas de lui-même : importez ses noms là où vous en avez besoin.

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

<!-- features -->

- `coder` : L’agent Codex, connecté avec votre compte.
- `sandboxProvider` : Démarre un conteneur depuis `outpost:dev` pour chaque tâche.
- `repository` : Le checkout à modifier : `OUTPOST_REPOSITORY` (chemin absolu) ou le répertoire courant.

## Vérifier l’installation

```sh
npx outpost doctor --image outpost:dev
```

`doctor` vérifie l’hôte, le moteur de conteneurs et l’image, et se termine avec le statut 1 en cas d’échec. Il ne teste ni la connexion ni l’accès au modèle ; consultez [Diagnostic](../diagnostics/).

## Lancer le projet généré

```sh
node run.ts "Describe this repository"
```

La progression s’affiche sur stderr, puis le script affiche la branche de travail, les commits de l’agent et sa conversation. Ctrl+C annule et affiche les informations de récupération.

:::caution
Le `run.ts` généré utilise `branch: { mode: "integrate" }` : il fusionne les commits de l’agent dans la branche extraite de votre dépôt. Pour relire d’abord, utilisez une branche nommée ([Dépôt et branche](../repository-and-branch/)).
:::

## Étapes suivantes

Lancez votre propre tâche depuis TypeScript avec [Votre première tâche](../first-request/).

API : [createAgent](../../reference/createagent/) · [createCodexHarness](../../reference/createcodexharness/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
