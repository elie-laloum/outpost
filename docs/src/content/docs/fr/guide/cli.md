---
title: "Commandes en ligne de commande"
description: "Construisez les images, vérifiez votre environnement et examinez les données de récupération depuis le terminal."
---

## Choisir une commande

Utilisez la ligne de commande pour construire les images, vérifier les prérequis et examiner le travail conservé. Écrivez les tâches d’agent en TypeScript et lancez-les avec Node.js, comme dans [Votre première tâche](../first-request/).

<!-- features -->

- [`outpost recipe run`](../yaml-recipes/): Exécute une recette YAML locale avec une sandbox et des agents explicites.
- [`outpost doctor`](../diagnostics/) : Vérifie l’hôte, le fournisseur de sandbox et une image.
- [`outpost image build`](../agent-images/) : Construit l’image d’agent à partir de sa recette.
- [`outpost image remove`](../agent-images/) : Supprime l’image d’agent.
- [`outpost recovery inspect`](../recovery/) : Liste ce que `.outpost` conserve, en lecture seule.
- [`outpost recovery verify`](../recovery/) : Contrôle un transfert conservé avant de le restaurer.
- [`outpost recovery restore`](../recovery/) : Restaure un transfert conservé dans un nouveau répertoire.
- [`outpost recovery prune`](../retention/) : Supprime les anciennes données selon une politique de rétention.
- [`outpost --help`](#options-communes) : Liste les commandes, ou les options d’une commande.

Dans un projet qui dépend de `@elie-laloum/outpost`, lancez `npx outpost <commande>`. Ailleurs, lancez `npx @elie-laloum/outpost <commande>`.

## Options communes

| Option       | Commandes                      | Effet                                                  |
| ------------ | ------------------------------ | ------------------------------------------------------ |
| `-h, --help` | Toutes                         | Affiche l’usage et les options, puis s’arrête.         |
| `--json`     | `doctor`, `recovery`, `recipe` | Écrit le rapport en JSON sur stdout.                   |
| `-y, --yes`  | `init`                         | Accepte les valeurs par défaut sans poser de question. |
| `--apply`    | `restore`, `prune`             | Effectue la modification ; sans elle, simple aperçu.   |

| Code de sortie | Signification                                                                                |
| -------------- | -------------------------------------------------------------------------------------------- |
| `0`            | Succès. Les avertissements et contrôles ignorés de `doctor` sortent aussi avec `0`.          |
| `1`            | Un contrôle a échoué, un rapport est incomplet ou la commande a échoué (message sur stderr). |
| `130`          | Interruption par Ctrl+C, ou question d’`init` annulée.                                       |
| `143`          | Arrêt par SIGTERM.                                                                           |

## `outpost doctor`

Vérifiez les outils de la machine et le fournisseur de sandbox choisi. Ajoutez `--image` pour vérifier aussi une image locale d’agent dans un conteneur temporaire.

```sh
outpost doctor [--sandbox-provider NAME] [--agent NAME] [--image NAME] [--json]
```

| Option               | Par défaut | Valeurs et effet                                                                           |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `--sandbox-provider` | `docker`   | `docker`, `podman`, `local`, `vercel`, `daytona`.                                          |
| `--agent`            | `codex`    | `codex`, `claude`, `antigravity`, `copilot`, `kimi`.                                       |
| `--image`            | Aucune     | Vérifie aussi cette image locale dans un conteneur temporaire. Docker et Podman seulement. |
| `--json`             | Désactivé  | Rapport JSON.                                                                              |

Il sort avec `1` quand un contrôle échoue. [Diagnostic](../diagnostics/) explique le rapport.

## `outpost image build`

Construisez l’image d’agent à partir de la recette du répertoire choisi. Sélectionnez Docker ou Podman et donnez à l’image le nom utilisé dans vos scripts.

```sh
outpost image build [--directory PATH] [--engine docker|podman] [--file PATH] [--image NAME] [--uid N] [--gid N]
```

| Option           | Par défaut                                                        | Valeurs et effet                                       |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `--directory`    | Répertoire courant                                                | Contexte de build contenant la recette.                |
| `--engine`       | `docker`                                                          | `docker`, `podman`.                                    |
| `--file`         | `Dockerfile` (Docker), `Containerfile` (Podman)                   | Chemin de la recette, relatif à `--directory`.         |
| `--image`        | `outpost:<nom du répertoire>`                                     | Tag de l’image.                                        |
| `--uid`, `--gid` | Vos identifiants d’utilisateur et de groupe (`1000` sous Windows) | Identifiants de l’utilisateur de l’agent dans l’image. |

La sortie du moteur s’affiche dans le terminal, puis la commande écrit `build: <image>`. Un build s’arrête au bout de 30 minutes.

## `outpost image remove`

Supprimez l’image locale d’agent lorsque vous n’en avez plus besoin. Utilisez le moteur et le nom de l’image que vous souhaitez supprimer.

```sh
outpost image remove [--directory PATH] [--engine docker|podman] [--image NAME]
```

`--directory`, `--engine` et `--image` prennent les mêmes valeurs par défaut qu’avec `image build`. La commande écrit `remove: <image>`.

## `outpost init`

Cette commande génère un projet d’exemple et, avec Docker ou Podman, prépare l’image. Le parcours recommandé dans [Installation](../setup/) l’utilise pour construire l’image ; vous écrivez ensuite vos propres scripts TypeScript.

```sh
outpost init [--yes] [--directory PATH] [--repository PATH] [--agent NAME] [--sandbox-provider NAME] [options]
```

Dans un terminal, `init` demande l’agent, le fournisseur de sandbox, le gestionnaire de paquets et l’authentification que vous n’avez pas passés. Hors terminal, passez `--yes`, ou à la fois `--agent` et `--sandbox-provider`.

| Option                  | Par défaut                                 | Valeurs et effet                                                                |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `--directory`           | Répertoire courant                         | Où le projet est écrit.                                                         |
| `--repository`          | `.`                                        | Checkout Git que modifie le workflow, relatif à `--directory`.                  |
| `--agent`               | `codex`                                    | `codex`, `claude`, `antigravity`, `copilot`, `kimi`.                            |
| `--sandbox-provider`    | `docker`                                   | `docker`, `podman`, `local`, `vercel`, `daytona`.                               |
| `--authentication`      | `account` (`usage` avec `--base-url`)      | `account`, `usage` ; `account-token` pour `claude` et `copilot`.                |
| `--model`               | Celui de la CLI                            | Nom du modèle. Requis pour Kimi en `usage` et avec `--base-url`.                |
| `--base-url`            | Aucun                                      | Endpoint Responses Codex personnalisé. Requiert `--model` et `usage`.           |
| `--api-key-env`         | `OPENAI_API_KEY`                           | Variable de la clé pour `--base-url`.                                           |
| `--manager`             | Champ `packageManager`, lockfile, ou `npm` | `npm`, `pnpm`, `yarn`, `bun`.                                                   |
| `--install`             | Désactivé                                  | Installe `@elie-laloum/outpost` et le SDK du fournisseur en dépendances de dev. |
| `--build`, `--no-build` | Build pour `docker` et `podman`            | Construit l’image une fois les fichiers écrits.                                 |
| `--image`               | `outpost:<nom du répertoire>`              | Tag de l’image construite et utilisée par `run.ts` (Docker et Podman).          |

`init` écrit `run.ts`, `brief.md`, `.env.example`, `.gitignore`, la recette d’image et, s’il n’en existe pas, `package.json` (génération facultative de projet). Il s’arrête avant d’écrire si l’un de ces fichiers existe, sauf `.gitignore`, qu’il complète.

Il affiche ensuite les étapes de connexion propres à l’[authentification](../authentication/) choisie et la commande à lancer, par exemple `node run.ts`.

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

API : [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).

## Pour aller plus loin

- [Options des commandes de recettes](../recipe-cli/)
- [Options des commandes de récupération](../recovery-cli/)

<span id="outpost-recipe-run"></span>
<span id="outpost-recipe-status-resume-answer-et-decide"></span>
<span id="outpost-recipe-enqueue-et-serve"></span>
<span id="outpost-recipe-init"></span>
<span id="outpost-recipe-validate"></span>
<span id="outpost-recipe-list-et-outpost-recipe-fetch"></span>

<span id="outpost-recovery-inspect"></span>
<span id="outpost-recovery-verify"></span>
<span id="outpost-recovery-restore"></span>
<span id="outpost-recovery-prune"></span>
