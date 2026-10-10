---
title: Jobs et services de recettes
description: Publier des jobs et démarrer explicitement workers, cron et webhooks.
---

Préparez une [configuration d’exécution](../recipe-configuration/) et une [recette durable](../recipe-durability/) avant de les confier à un worker. Les blocs ci-dessous complètent ce fichier ; les déclarer ne démarre aucun service en arrière-plan.

La configuration de format 2 déclare files, jobs et services aux côtés des agents et du stockage. Lire ou valider ces déclarations ne démarre aucun serveur, worker ou planning. `recipe enqueue` publie un job ; `recipe serve --service` démarre uniquement le service sélectionné et ses dépendances. Les [recettes durables](../recipe-durability/) expliquent leurs checkpoints.

## Déclarer une file et un job de recette

Une file SQLite stocke les jobs localement. Une file HTTP utilise `type: http`, une URL et un token référencé par environnement ou callback de rotation. BullMQ utilise `type: bullmq`, les options Redis natives et le paquet BullMQ facultatif. Propriété, protection des leases et déduplication restent celles des [files natives](../job-queues/).

```yaml title="outpost.yaml — jobs"
queues:
  jobs: { type: sqlite, file: ./.outpost/jobs.sqlite }
jobs:
  review:
    type: recipe
    file: ./recipe.yaml
    config: ./outpost.yaml
```

Un job `recipe` accepte `{ runId, input }`, où `input` est une table de paramètres ou null. Il crée un runtime, démarre ou reprend ce checkpoint puis ferme ses ressources. La recette cible doit configurer un magasin de checkpoints permettant l’inspection. Les paramètres font partie de l’identité durable : une entrée modifiée ne réutilise pas silencieusement une exécution existante. `retryIncomplete: true` autorise explicitement le rejeu interrompu pour ce handler. Pour une factory TypeScript de confiance, utilisez `type: workflow` avec [WorkflowJobOptions](../../reference/workflowjoboptions/) et une référence de callback local.

## Démarrer un worker explicitement

Un worker associe des noms de handlers à des jobs déclarés. Sa déclaration seule ne réclame aucun travail. Il utilise le moteur natif, renouvelle les leases et ferme sa file possédée à l’arrêt. Une file prêtée par extension reste sous la responsabilité de son propriétaire.

```yaml title="outpost.yaml — worker"
services:
  worker:
    type: worker
    queue: { $ref: queues.jobs }
    worker: local-review-worker
    handlers:
      review: { $ref: jobs.review }
```

Publiez depuis un terminal puis démarrez le worker depuis un autre. Enqueue reste silencieux sans `--json`. L’ID de job par défaut est `recipe:<handler>:<run-id>` ; les publications répétées convergent sur la même requête. Pour reprendre ultérieurement un run en pause, choisissez un nouveau `--job-id` en conservant l’identité d’effet voulue avec `--idempotency-key`. Les effets externes exigent toujours une déduplication persistante à destination.

```sh
outpost recipe enqueue --file recipe.yaml --config outpost.yaml \
  --queue jobs --handler review --run-id change-42 --json
outpost recipe serve --file recipe.yaml --config outpost.yaml \
  --service worker
```

`serve` reste actif jusqu’à interruption ou fermeture de son runtime, sans progression implicite. Chaque recette exécutée conserve son observation et ses rapports déclarés ; les jobs en échec gardent leur résultat natif de file et `recipe status` consulte l’exécution durable. `examples/70-recipe-services/` démontre un worker SQLite et l’inspection de son résultat hors ligne.

## Publier sur cron ou webhook authentifié

Les composants cron gardent les règles natives d’heure civile et de fuseau. Un planning publie seulement le dernier créneau admissible sous `schedule:<name>:<slot>` ; il n’appelle aucun workflow. `input` accepte du JSON fixe ou un callback local, et un callback `runId` remplace l’ID de checkpoint par défaut. Démarrez ce service explicitement, indépendamment du worker.

```yaml title="outpost.yaml — plannings"
crons:
  hourly: { type: schedule, expression: "0 * * * *", timeZone: UTC }
schedules:
  review:
    type: cron
    name: hourly-review
    cron: { $ref: crons.hourly }
    handler: review
    input: { goal: Review recent commits. }
services:
  clock:
    type: schedules
    queue: { $ref: queues.jobs }
    schedules: [{ $ref: schedules.review }]
```

Les sources prennent en charge GitHub, GitLab, Slack et Standard Webhooks avec leurs options natives. Les secrets sont des références d’environnement ou de callbacks de rotation explicites. Un mapper `job` filtre types/actions, choisit un handler et forme un ID avec source/préfixe et livraison. Son entrée par défaut est le payload authentifié ; `input` fixe ou une extension locale `triggerMapper` l’adapte aux paramètres de recette. L’identité authentifiée de l’émetteur ne devient pas un acteur autorisé de gate.

```yaml title="outpost.yaml — source vérifiée"
triggers:
  github: { type: github, secret: { env: GITHUB_WEBHOOK_SECRET } }
routes:
  review:
    type: job
    handler: review
    kinds: [pull_request]
    actions: [opened, synchronize]
    runIdPrefix: review
    input: { goal: Review recent commits. }
```

Associez cette source et ce mapper à un chemin exact. Le serveur natif vérifie la requête avant le mapper et publie des jobs `trigger:<path>:<delivery>`. `type: queue` sert le protocole HTTP authentifié de file avec `queue`, `token`, `host` et `port` ; il ne démarre pas de worker. Les serveurs écoutent localhost par défaut. Le [guide des triggers](../webhooks/) détaille transport et signatures.

```yaml title="outpost.yaml — service webhook"
services:
  webhooks:
    type: triggers
    queue: { $ref: queues.jobs }
    port: 8080
    routes:
      - path: /github
        source: { $ref: triggers.github }
        on: { $ref: routes.review }
```

## Attendre un job depuis une recette

Une tâche `queued` utilise [defineQueuedTask](../../reference/definequeuedtask/) et ses règles natives de polling, annulation, consommation et quota. `arguments` construit l’entrée du handler. Un callback local `queued.input` peut remplacer cette expression et `queued.decode` personnalise le résultat JSON. La projection par défaut expose la valeur décodée sous `value`.

```yaml title="recipe.yaml — tâche en file"
- key: remote-review
  queued:
    queue: { $ref: queues.jobs }
    handler: review
  arguments:
    runId: change-42
    input: { goal: Review recent commits. }
```

Les tests locaux couvrent publication silencieuse, démarrage explicite, annulation, rotation des tokens, webhooks signés, publication cron et jobs natifs. Les tests Redis 7 réels couvrent leases BullMQ, écritures obsolètes, effets interrompus et workers YAML. Aucun modèle payant ni endpoint public n’est utilisé ; TLS de production, Redis hébergé et livraisons réelles des émetteurs restent non validés.

## Workspaces de fichiers

Pour exécuter un service sans Git, utiliser la configuration 3 avec une source de fichiers explicite pour les tâches de sandbox, ou omettre workspace et sandbox pour les tâches sans fichiers. Files, schedules, webhooks et jobs nommés gardent leurs contrats existants. Voir [les workspaces de fichiers](../workspaces/).
