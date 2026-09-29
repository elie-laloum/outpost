---
title: "Commandes CLI"
description: "Toutes les commandes outpost avec leurs options, valeurs par défaut et codes de sortie : génération de projet, diagnostic, images et récupération."
---

## Carte des commandes

La CLI prépare et entretient l’environnement. Les tâches d’agent s’exécutent depuis vos scripts, pas depuis la CLI.

<!-- features -->

- [`outpost init`](../setup/) : Génère un projet de workflow et construit son image.
- [`outpost doctor`](../diagnostics/) : Vérifie l’hôte, le provider de sandbox et une image.
- [`outpost image build`](../agent-images/) : Construit l’image d’agent à partir de sa recette.
- [`outpost image remove`](../agent-images/) : Supprime l’image d’agent.
- [`outpost recovery inspect`](../recovery/) : Liste ce que `.outpost` conserve, en lecture seule.
- [`outpost recovery verify`](../recovery/) : Contrôle un transfert conservé avant de le restaurer.
- [`outpost recovery restore`](../recovery/) : Restaure un transfert conservé dans un nouveau répertoire.
- [`outpost recovery prune`](../retention/) : Supprime les anciennes données selon une politique de rétention.
- [`outpost --help`](#options-communes) : Liste les commandes, ou les options d’une commande.

Dans un projet qui dépend de `@elie-laloum/outpost`, lancez `npx outpost <commande>`. Ailleurs, lancez `npx @elie-laloum/outpost <commande>`.

## Options communes

| Option       | Commandes            | Effet                                                  |
| ------------ | -------------------- | ------------------------------------------------------ |
| `-h, --help` | Toutes               | Affiche l’usage et les options, puis s’arrête.         |
| `--json`     | `doctor`, `recovery` | Écrit le rapport en JSON sur stdout.                   |
| `-y, --yes`  | `init`               | Accepte les valeurs par défaut sans poser de question. |
| `--apply`    | `restore`, `prune`   | Effectue la modification ; sans elle, simple aperçu.   |

| Code de sortie | Signification                                                                                |
| -------------- | -------------------------------------------------------------------------------------------- |
| `0`            | Succès. Les avertissements et contrôles ignorés de `doctor` sortent aussi avec `0`.          |
| `1`            | Un contrôle a échoué, un rapport est incomplet ou la commande a échoué (message sur stderr). |
| `130`          | Interruption par Ctrl+C, ou question d’`init` annulée.                                       |
| `143`          | Arrêt par SIGTERM.                                                                           |

## `outpost init`

```sh
outpost init [--yes] [--directory PATH] [--repository PATH] [--agent NAME] [--sandbox-provider NAME] [options]
```

Dans un terminal, `init` demande l’agent, le provider de sandbox, le gestionnaire de paquets et l’authentification que vous n’avez pas passés. Hors terminal, passez `--yes`, ou à la fois `--agent` et `--sandbox-provider`.

| Option                  | Par défaut                                 | Valeurs et effet                                                             |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| `--directory`           | Répertoire courant                         | Où le projet est écrit.                                                      |
| `--repository`          | `.`                                        | Checkout Git que modifie le workflow, relatif à `--directory`.               |
| `--agent`               | `codex`                                    | `codex`, `claude`, `antigravity`, `copilot`, `kimi`.                         |
| `--sandbox-provider`    | `docker`                                   | `docker`, `podman`, `local`, `vercel`, `daytona`.                            |
| `--authentication`      | `account` (`usage` avec `--base-url`)      | `account`, `usage` ; `account-token` pour `claude` et `copilot`.             |
| `--model`               | Celui de la CLI                            | Nom du modèle. Requis pour Kimi en `usage` et avec `--base-url`.             |
| `--base-url`            | Aucun                                      | Endpoint Responses Codex personnalisé. Requiert `--model` et `usage`.        |
| `--api-key-env`         | `OPENAI_API_KEY`                           | Variable de la clé pour `--base-url`.                                        |
| `--manager`             | Champ `packageManager`, lockfile, ou `npm` | `npm`, `pnpm`, `yarn`, `bun`.                                                |
| `--install`             | Désactivé                                  | Installe `@elie-laloum/outpost` et le SDK du provider en dépendances de dev. |
| `--build`, `--no-build` | Build pour `docker` et `podman`            | Construit l’image une fois les fichiers écrits.                              |
| `--image`               | `outpost:<nom du répertoire>`              | Tag de l’image construite et utilisée par `run.ts` (Docker et Podman).       |

`init` écrit `run.ts`, `brief.md`, `.env.example`, `.gitignore`, la recette d’image et, s’il n’en existe pas, `package.json` ([Installation](../setup/) décrit chaque fichier). Il s’arrête avant d’écrire si l’un de ces fichiers existe, sauf `.gitignore`, qu’il complète.

Il affiche ensuite les étapes de connexion propres à l’[authentification](../authentication/) choisie et la commande à lancer, par exemple `node run.ts`.

```sh
npx @elie-laloum/outpost init --yes --directory ./automation --repository ../application --agent claude --install
```

## `outpost doctor`

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

```sh
outpost image remove [--directory PATH] [--engine docker|podman] [--image NAME]
```

`--directory`, `--engine` et `--image` prennent les mêmes valeurs par défaut qu’avec `image build`. La commande écrit `remove: <image>`.

## `outpost recovery inspect`

```sh
outpost recovery inspect [--repository PATH] [--max-entries N] [--git] [--locks] [--resources] [--json]
```

| Option          | Par défaut                     | Valeurs et effet                                                  |
| --------------- | ------------------------------ | ----------------------------------------------------------------- |
| `--repository`  | Checkout du répertoire courant | Dépôt dont le `.outpost` est listé.                               |
| `--max-entries` | `100000`                       | Arrête l’inventaire après ce nombre d’entrées.                    |
| `--git`         | Désactivé                      | Ajoute la branche, le HEAD et l’état modifié de chaque workspace. |
| `--locks`       | Désactivé                      | Ajoute les PID et la propriété des verrous locaux.                |
| `--resources`   | Désactivé                      | Ajoute l’activité de sandbox enregistrée.                         |
| `--json`        | Désactivé                      | Rapport JSON.                                                     |

Il ne modifie rien. Il sort avec `1` quand l’inventaire est partiel.

## `outpost recovery verify`

```sh
outpost recovery verify --directory TRANSFER [--checksums [--max-bytes N]] [--restorability --repository PATH] [--json]
```

| Option            | Par défaut | Valeurs et effet                                                             |
| ----------------- | ---------- | ---------------------------------------------------------------------------- |
| `--directory`     | Requis     | Répertoire du transfert conservé.                                            |
| `--checksums`     | Désactivé  | Compare les fichiers au manifeste de sommes de contrôle du transfert.        |
| `--max-bytes`     | 1 Gio      | Octets vérifiés par `--checksums`, qu’il requiert.                           |
| `--restorability` | Désactivé  | Applique les patchs du transfert dans un clone temporaire de `--repository`. |
| `--repository`    | Aucun      | Checkout utilisé par `--restorability` ; les deux vont ensemble.             |
| `--json`          | Désactivé  | Rapport JSON.                                                                |

Il ne modifie aucun fichier. Il sort avec `1` quand un contrôle échoue ou reste incomplet.

## `outpost recovery restore`

```sh
outpost recovery restore --directory TRANSFER --repository PATH --destination NEW_PATH --side previous|incoming [--max-bytes N] [--apply] [--json]
```

| Option          | Par défaut | Valeurs et effet                                                                               |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `--directory`   | Requis     | Répertoire du transfert conservé.                                                              |
| `--repository`  | Requis     | Checkout auquel appartient le transfert.                                                       |
| `--destination` | Requis     | Nouveau répertoire hors du dépôt ; il ne doit pas exister.                                     |
| `--side`        | Requis     | `previous` (état de l’hôte avant synchronisation) ou `incoming` (modifications de la sandbox). |
| `--max-bytes`   | 1 Gio      | Taille maximale acceptée pour le contenu conservé.                                             |
| `--apply`       | Désactivé  | Crée la destination ; sans elle, affiche le plan.                                              |
| `--json`        | Désactivé  | Plan ou résultat en JSON.                                                                      |

La copie restaurée est un checkout détaché. Le transfert reste en place ; examinez la copie avant de l’intégrer.

## `outpost recovery prune`

```sh
outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]
```

| Option         | Par défaut                     | Valeurs et effet                                                     |
| -------------- | ------------------------------ | -------------------------------------------------------------------- |
| `--policy`     | Requis                         | Fichier de politique JSON, 64 Kio au plus ([format](../retention/)). |
| `--repository` | Checkout du répertoire courant | Dépôt dont le `.outpost` est nettoyé.                                |
| `--apply`      | Désactivé                      | Supprime les candidats ; sans elle, simple essai à blanc.            |
| `--json`       | Désactivé                      | Plan et résultat en JSON.                                            |

Il sort avec `1` quand l’inventaire est incomplet, que la taille projetée dépasse la limite de la politique, ou que `--apply` a dû garder un candidat. Les branches et les artefacts de récupération sont toujours conservés.

API : [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).
