---
title: "Commandes en ligne de commande"
description: "Vérifiez votre environnement, préparez les images d’agent, exécutez des recettes YAML et examinez les données de récupération depuis le terminal."
---

## Choisir une commande

La ligne de commande prépare et vérifie l’environnement où s’exécutent vos scripts ou recettes. Écrivez les tâches d’agent en TypeScript et lancez-les avec Node.js, comme dans [Votre première tâche](../first-request/), ou décrivez-les dans une [recette YAML](../yaml-recipes/). La CLI ne crée jamais de projet sur votre machine.

<!-- features -->

- [`outpost doctor`](#outpost-doctor) : Vérifie l’hôte, le fournisseur de sandbox et une image.
- [`outpost image`](#outpost-image) : Liste, télécharge, vérifie, éjecte, construit et supprime les [images d’agent](../agent-images/).
- [`outpost recipe`](../recipe-cli/) : Crée, valide, exécute et reprend des recettes YAML.
- [`outpost recovery`](../recovery-cli/) : Examine et récupère explicitement un état interrompu.
- [`outpost --help`](#options-communes) : Liste les commandes par tâche, ou les options et exemples d’une commande.

Dans un projet qui dépend de `@elie-laloum/outpost`, lancez `npx outpost <commande>`. Ailleurs, lancez `npx @elie-laloum/outpost <commande>`.

## Options communes

| Option          | Commandes                | Effet                                                        |
| --------------- | ------------------------ | ------------------------------------------------------------ |
| `-h, --help`    | Toutes                   | Affiche l’usage, les options et des exemples, puis s’arrête. |
| `-v, --version` | `outpost`                | Affiche la version d’Outpost installée.                      |
| `--json`        | La plupart des commandes | Écrit le résultat en JSON sur stdout.                        |
| `--apply`       | Récupération             | Effectue la modification ; sans elle, simple aperçu.         |

| Code de sortie | Signification                                                                                |
| -------------- | -------------------------------------------------------------------------------------------- |
| `0`            | Succès. Les avertissements et contrôles ignorés de `doctor` sortent aussi avec `0`.          |
| `1`            | Un contrôle a échoué, un rapport est incomplet ou la commande a échoué (message sur stderr). |
| `130`          | Interruption par Ctrl+C.                                                                     |
| `143`          | Arrêt par SIGTERM.                                                                           |

## `outpost doctor`

Vérifiez les outils de la machine et le fournisseur de sandbox choisi. Ajoutez `--image` pour vérifier aussi une image dans un conteneur temporaire.

```sh
outpost doctor [--provider NAME] [--agent NAME] [--image NAME] [--timeout MS] [--json]
```

| Option       | Par défaut | Valeurs et effet                                                                                                                  |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--provider` | `docker`   | `docker`, `podman`, `local`, `vercel`, `daytona`.                                                                                 |
| `--agent`    | `codex`    | `codex`, `claude`, `antigravity`, `copilot`, `kimi`. Par défaut, l’agent de l’image quand `--image` désigne une image officielle. |
| `--image`    | Aucune     | Référence d’image locale ou nom d’image officielle, vérifiée dans un conteneur temporaire. Docker et Podman seulement.            |
| `--json`     | Désactivé  | Rapport JSON.                                                                                                                     |

Il sort avec `1` quand un contrôle échoue. [Diagnostic](../diagnostics/) explique le rapport.

## `outpost image`

Préparez l’image exécutée par votre fournisseur de sandbox. Les noms officiels sont `harness`, `codex`, `claude`, `antigravity`, `copilot` et `kimi` ([Images d’agent](../agent-images/)).

| Commande                                                                            | Effet                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `image list [--json]`                                                               | Liste les images officielles et la référence épinglée par cette version.                         |
| `image pull --image NAME [--engine E]`                                              | Télécharge l’image publiée : son digest enregistré, ou le tag correspondant à cette version.     |
| `image verify --image NAME_OR_REFERENCE`                                            | Vérifie l’attestation de provenance GitHub d’un digest. Nécessite `gh`.                          |
| `image eject --image NAME [--directory D] [--engine E] [--force]`                   | Écrit la recette officielle, les lockfiles et le `.dockerignore` dans le dossier courant ou `D`. |
| `image build --tag TAG [--directory D] [--engine E] [--file F] [--uid N] [--gid N]` | Construit la recette de `D` pour votre UID et votre GID (`1000` sous Windows).                   |
| `image remove --image REFERENCE [--engine E]`                                       | Supprime une image locale.                                                                       |

`--engine` vaut `docker` par défaut ; `podman` écrit et construit un `Containerfile`. `eject` refuse d’écraser des fichiers existants sans `--force`. La sortie du moteur s’affiche dans le terminal ; une construction s’arrête au bout de 30 minutes.

```sh
npx outpost image eject --image claude --directory images/claude
npx outpost image build --directory images/claude --tag outpost-claude:dev
```

## Commandes renommées

Les anciens noms fonctionnent encore et affichent un avertissement de dépréciation. Ils seront retirés à la prochaine version majeure.

| Ancien nom                          | Nom actuel                              |
| ----------------------------------- | --------------------------------------- |
| `--provider`                        | `--provider`                            |
| `recovery verify --directory PATH`  | `recovery transfer verify --path PATH`  |
| `recovery restore --directory PATH` | `recovery transfer restore --path PATH` |
| `recovery registry recover`         | `recovery registry release`             |

`outpost init` a été retiré : installez le paquet dans vos propres scripts ([Installation](../setup/)), préparez une image avec `outpost image` et créez les fichiers de recette avec `outpost recipe init`.

API : [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).

## Pour aller plus loin

- [Options des commandes de recettes](../recipe-cli/)
- [Options des commandes de récupération](../recovery-cli/)

<span id="outpost-image-build"></span>
<span id="outpost-image-remove"></span>
<span id="outpost-init"></span>
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
