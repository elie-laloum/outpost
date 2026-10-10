---
title: "Commandes de recettes"
description: "Utilisez ces commandes après votre première recette YAML."
---

Utilisez ces commandes après [votre première recette YAML](../yaml-recipes/). `outpost recipe <commande> --help` affiche l’aide locale ; les [options communes et codes de sortie](../cli/) s’appliquent.

## `outpost recipe run`

Exécutez une [recette YAML locale](../yaml-recipes/) avec une configuration YAML séparée (obligatoire), un module TypeScript ou une factory existante. Les paramètres sont vérifiés avant le chargement de la configuration ; les configurations déclaratives vérifient aussi les agents requis avant l’allocation.

Pour les intégrations personnalisées, les modules TypeScript/JavaScript [RecipeConfiguration](../../reference/recipeconfiguration/) et les factories `(signal: AbortSignal) => RecipeBindings` restent pris en charge. Une factory retourne une sandbox déjà ouverte : les rôles sont vérifiés après allocation, et elle doit nettoyer les ressources si elle échoue avant de retourner.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'goal=Fix the parser' [--json]
```

| Option             | Défaut                                     | Effet                                                                                                                                                                                 |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--file`           | Obligatoire                                | Recette YAML locale, limitée à 1 Mio.                                                                                                                                                 |
| `--config`         | Obligatoire                                | Configuration YAML locale ; les modules TypeScript/JavaScript `RecipeConfiguration` et factories restent acceptés.                                                                    |
| `--input`          | Aucun                                      | Répétez `name=value` pour les paramètres déclarés de version 2. Nombres et booléens utilisent la syntaxe scalaire JSON.                                                               |
| `--json`           | Désactivé                                  | Rapport final avec `status` global, `workflowStatus`, tâches, `outputs` bornés, `errors`, consommation et emplacement du workspace.                                                   |
| `--interactive`    | Automatique dans un terminal sans `--json` | Recueille réponses et décisions explicites de gates non signées sur stdin, affiche leurs demandes sur stderr et reprend. Exige stdin et stderr en terminal et une configuration YAML. |
| `--no-interactive` | Désactivé                                  | Laisse les questions en attente pour une prochaine invocation ou un client externe.                                                                                                   |
| `--actor`          | Acteur déclaré unique, sinon sélection     | Acteur local de confiance soumettant les réponses ; le moteur vérifie son autorisation pour la tâche.                                                                                 |

Avec stdin et stderr dans un terminal, run gère les questions interactives sans script TypeScript. Les choix utilisent un menu de sélection et les questions libres un champ de texte. Chaque réponse est persistée avant la question suivante. `--json` désactive la saisie automatique ; combinez explicitement `--interactive --json` pour conserver les questions sur stderr et recevoir un seul rapport JSON final sur stdout. Sans terminal, l’exécution laisse les demandes en attente.

Les chemins sont relatifs au dossier courant. Hormis les questions du dialogue, une exécution réussie est silencieuse sans observation ni rapports déclarés dans la configuration version 2. `--json` demande explicitement un seul rapport final JSON ; les échecs affichent toujours leurs diagnostics sur stderr.

Les champs textuels sont limités à 16 384 caractères avec un marqueur de troncature. Les diagnostics de commandes comprennent leur code de sortie d’origine, stdout et stderr.

Les exécutions réussies intègrent selon la politique de branche ; le rapport final est émis après nettoyage. Les workspaces échoués ou annulés sont conservés.

Les échecs de chargement, d’exécution ou de finalisation sortent avec le code 1. SIGINT/SIGTERM annulent le run, attendent le nettoyage et sortent avec 130/143. Gardez stdout silencieux dans la configuration pour un JSON exploitable.

## `outpost recipe status`, `resume`, `answer` et `decide`

Ces commandes exigent le format 3, un `--config` YAML, `--file` et `--run-id`. Status lit le checkpoint sans l’acquérir. Resume continue l’exécution ; `--retry-incomplete` autorise explicitement le rejeu des tâches interrompues. Après arrêt du coordinateur abandonné, `--recover-revision <revision>` protège la récupération du checkpoint indépendamment du rejeu et des verrous de workspace.

```sh
outpost recipe status --file recipe.yaml --config outpost.yaml --run-id change --json
outpost recipe resume --file recipe.yaml --config outpost.yaml --run-id change
outpost recipe answer --file recipe.yaml --config outpost.yaml --run-id change --answer answer.json
outpost recipe decide --file recipe.yaml --config outpost.yaml --run-id change --decision decision.json
```

Answer et decide lisent une WorkflowAnswer ou WorkflowDecision native dans un fichier JSON borné ; une gate signée exige sa preuve originale. `resume --input` doit correspondre aux paramètres persistés ; omettez-le pour les recharger. Run accepte aussi `--run-id` pour créer un checkpoint. Run, resume, answer et decide n’affichent un rapport final que s’il est déclaré ou demandé via `--json` ; status affiche toujours son résultat demandé. Consultez les [recettes durables](../recipe-durability/) pour l’état, la propriété et la récupération.

Resume, answer et decide acceptent les mêmes options `--interactive`, `--no-interactive` et `--actor`. Ctrl+C ou la fermeture de l’entrée pendant une question la laisse en attente et sort avec 130 ; resume la repose sans rejouer les tours terminés.

La sélection d’acteur déclare une identité locale de confiance, sans authentification.

Les gates non signées affichent les résultats sauvegardés de leurs dépendances, puis proposent Leave pending, Approve/Resume ou Reject avec un motif obligatoire. Le choix par défaut laisse la gate en attente.

Les gates signées exigent toujours `decide` avec leurs preuves existantes ; la saisie en terminal ne fournit ni ne contourne ces preuves.

## `outpost recipe enqueue` et `serve`

Enqueue publie sans exécuter. Il exige `--file`, un `--config` YAML, `--queue`, `--handler` et `--run-id` ; les `--input` répétés suivent les types de paramètres. `--job-id` remplace l’ID déterministe par défaut, `--idempotency-key` conserve une clé d’effet entre jobs distincts et `--deadline` est une date absolue en millisecondes epoch. `--json` demande un reçu ; le succès reste sinon silencieux.

```sh
outpost recipe enqueue --file recipe.yaml --config outpost.yaml \
  --queue jobs --handler review --run-id change-42 --json
outpost recipe serve --file recipe.yaml --config outpost.yaml --service worker
```

Serve exige `--file`, un `--config` YAML et `--service`. Il démarre uniquement ce service, bloque jusqu’à interruption et n’émet aucune progression ni rapport implicite. Les [services de recettes](../recipe-services/) détaillent workers, files HTTP, cron et webhooks vérifiés.

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

`--recipe` sélectionne l’entrée du catalogue et `--file` la destination. Le rapport JSON comprend nom, révision de recette, SHA-256 et chemin enregistré. Les sources et redirections distantes exigent HTTPS sans identifiants dans l’URL ; chaque ressource est limitée à 1 Mio et 15 secondes. Le catalogue fournit l’empreinte attendue : faites confiance à son éditeur. Consultez [la contribution de recettes](../sharing-recipes/#contribuer-et-tester-une-recette) pour le format.
