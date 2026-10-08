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

## `outpost recipe run`

Exécutez une [recette YAML locale](../yaml-recipes/) avec une configuration YAML séparée (obligatoire), un module TypeScript ou une factory existante. Les paramètres sont vérifiés avant le chargement de la configuration ; les configurations déclaratives vérifient aussi les agents requis avant l’allocation.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'goal=Fix the parser' [--json]
```

| Option     | Défaut      | Effet                                                                                                                               |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--file`   | Obligatoire | Recette YAML locale, limitée à 1 Mio.                                                                                               |
| `--config` | Obligatoire | Configuration YAML locale ; les modules TypeScript/JavaScript `RecipeConfiguration` et factories restent acceptés.                  |
| `--input`  | Aucun       | Répétez `name=value` pour les paramètres déclarés de version 2. Nombres et booléens utilisent la syntaxe scalaire JSON.             |
| `--json`   | Désactivé   | Rapport final avec `status` global, `workflowStatus`, tâches, `outputs` bornés, `errors`, consommation et emplacement du workspace. |

Les chemins sont relatifs au dossier courant. Sans `--json`, la CLI affiche le statut final, les sorties des tâches, les diagnostics et le workspace conservé. Les champs textuels sont limités à 16 384 caractères avec un marqueur de troncature. Les diagnostics de commandes comprennent leur code de sortie d’origine, stdout et stderr. Les exécutions réussies intègrent selon la politique de branche ; le rapport final est émis après nettoyage. Les workspaces échoués ou annulés sont conservés. Les échecs de chargement, d’exécution ou de finalisation sortent avec le code 1. SIGINT/SIGTERM annulent le run, attendent le nettoyage et sortent avec 130/143. Gardez stdout silencieux dans la configuration pour un JSON exploitable.

## `outpost recipe init`

Créez un modèle de version 2 avec un objectif obligatoire, un agent nommé et une commande de test. Le commentaire du schéma pour l’éditeur pointe vers le paquet installé. Les fichiers existants ne sont jamais écrasés ; le dossier parent doit exister.

```sh
outpost recipe init --file recipe.yaml [--config outpost.yaml] [--json]
```

`--file` est obligatoire. `--config` crée aussi une configuration YAML séparée. `--json` rapporte les chemins créés et le chemin du schéma. Adaptez les outils et rôles d’agents avant de partager le YAML.

## `outpost recipe validate`

Validez le YAML, les dépendances et les références sans importer la configuration, résoudre les valeurs des paramètres ni allouer de sandbox. Utilisez cette commande pour vérifier les contributions et avant d’exécuter une recette téléchargée.

```sh
outpost recipe validate --file recipe.yaml [--config outpost.yaml] [--json]
```

`--file` est obligatoire. L’option `--config` valide une configuration YAML et les rôles d’agents requis sans allouer de ressource ni lire les valeurs des secrets déclarés ; cette commande refuse les modules de configuration exécutables. `--json` rapporte le nom de la recette, la version du format, les métadonnées, les définitions de paramètres, les noms d’agents requis et les clés de tâches ordonnées. La validation n’exécute aucun outil et ne vérifie pas leur installation.

## `outpost recipe list` et `outpost recipe fetch`

Listez le catalogue Git inclus ou choisissez un fichier JSON local / catalogue HTTPS avec `--catalog`. Téléchargez une recette nommée dans un nouveau fichier local, vérifiez son SHA-256 et son identité déclarée, puis validez son YAML avant d’écrire. Les fichiers existants ne sont jamais écrasés ; télécharger n’exécute pas la recette.

```sh
outpost recipe list [--catalog https://example.org/catalog.json] [--json]
outpost recipe fetch --recipe review --file review.yaml \
  [--catalog https://example.org/catalog.json] [--json]
```

`--recipe` sélectionne l’entrée du catalogue et `--file` la destination. Le rapport JSON comprend nom, révision de recette, SHA-256 et chemin enregistré. Les sources et redirections distantes exigent HTTPS sans identifiants dans l’URL ; chaque ressource est limitée à 1 Mio et 15 secondes. Le catalogue fournit l’empreinte attendue : faites confiance à son éditeur. Consultez [la contribution de recettes](../yaml-recipes/#contribuer-et-tester-une-recette) pour le format.

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

## `outpost recovery inspect`

Examinez les workspaces, les transferts conservés et l’activité enregistrée dans le `.outpost` d’un dépôt. Cette commande lit l’inventaire sans le modifier.

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

Vérifiez un transfert conservé avant de le restaurer. Vous pouvez comparer les sommes de contrôle et tester l’application de ses patchs dans un clone temporaire.

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

Restaurez l’état sauvegardé de la machine ou les modifications reçues de la sandbox dans un nouveau répertoire. Consultez d’abord le plan, puis ajoutez `--apply` lorsque vous êtes prêt à créer la copie.

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

Prévisualisez les suppressions choisies par votre politique de rétention JSON. Ajoutez `--apply` pour supprimer ces entrées après avoir examiné le plan.

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
