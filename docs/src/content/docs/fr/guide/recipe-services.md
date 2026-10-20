---
title: "Mettre une recette en file et lancer un worker"
description: "Exécuter des recettes persistantes depuis une file, une planification ou un webhook vérifié."
---

Partez des deux fichiers en version 3 du guide [Enregistrer et reprendre une recette](../recipe-durability/). Ajoutez les blocs ci-dessous à `outpost.yaml`. Les déclarations seules ne démarrent rien : un service se lance avec `recipe serve`.

## Déclarer la file et le worker

Cette file SQLite stocke les jobs localement. Le handler `review` exécute votre recette avec checkpoint. Gardez les déclarations `transports` et `stores` existantes.

```yaml title="outpost.yaml — queue and worker"
queues:
  jobs: { type: sqlite, file: ./.outpost/jobs.sqlite }
jobs:
  review:
    type: recipe
    file: ./recipe.yaml
    config: ./outpost.yaml
services:
  worker:
    type: worker
    queue: { $ref: queues.jobs }
    worker: local-review-worker
    handlers:
      review: { $ref: jobs.review }
```

## Publier et traiter un job

La première commande publie seulement le travail et affiche son reçu. La seconde lance le worker, qui reste actif jusqu’à Ctrl+C. Pour cette recette d’approbation, l’exécution attend à son étape de validation ; examinez-la avec `recipe status --run-id change-42` et les mêmes `--file` et `--config`.

```sh
npx outpost recipe enqueue --file recipe.yaml --config outpost.yaml   --queue jobs --handler review --run-id change-42 --json
npx outpost recipe serve --file recipe.yaml --config outpost.yaml   --service worker
```

L’identifiant de job par défaut est `recipe:<handler>:<run-id>`. Republier converge vers la même demande. Pour remettre une reprise en file, choisissez un nouveau `--job-id` ; conservez la clé d’effet souhaitée avec `--idempotency-key`. Les services externes doivent dédupliquer leurs propres effets.

Pour HTTP ou BullMQ, remplacez la file par le [composant adapté](../yaml-components/). Voir [la propriété des files et les leases](../job-queues/) ; le worker ferme ses files possédées, pas les extensions empruntées.

## Publier selon un horaire

Ajoutez ces déclarations à la racine. Cette recette n’a pas de paramètres : son entrée planifiée est donc vide. Une recette paramétrée utilise leurs noms ici.

```yaml title="outpost.yaml — schedule"
crons:
  hourly: { type: schedule, expression: "0 * * * *", timeZone: UTC }
schedules:
  review:
    type: cron
    name: hourly-review
    cron: { $ref: crons.hourly }
    handler: review
    input: {}
```

Ajoutez `clock` **dans le bloc `services` existant**, à côté de `worker`. Lancez-le dans un autre terminal avec `recipe serve --file recipe.yaml --config outpost.yaml --service clock`.

```yaml title="outpost.yaml — add under services"
clock:
  type: schedules
  queue: { $ref: queues.jobs }
  schedules: [{ $ref: schedules.review }]
```

L’horloge publie les jobs ; le worker les exécute. Les identifiants de créneau dédupliquent les redémarrages, et seul le dernier créneau manqué admissible est rattrapé. Voir [les planifications cron](../cron-schedules/) pour les fuseaux et retards.

## Publier depuis un webhook vérifié

Ajoutez ces déclarations à la racine et définissez `GITHUB_WEBHOOK_SECRET` sur l’hôte. Cette route accepte les événements de pull request sélectionnés et soumet la même recette sans paramètres.

```yaml title="outpost.yaml — webhook source and route"
triggers:
  github: { type: github, secret: { env: GITHUB_WEBHOOK_SECRET } }
routes:
  review:
    type: job
    handler: review
    kinds: [pull_request]
    actions: [opened, synchronize]
    runIdPrefix: review
    input: {}
```

Ajoutez `webhooks` **dans le bloc `services` existant**. Lancez-le séparément avec `--service webhooks`. Le serveur écoute sur localhost par défaut et vérifie les requêtes avant publication dans la file.

```yaml title="outpost.yaml — add under services"
webhooks:
  type: triggers
  queue: { $ref: queues.jobs }
  port: 8080
  routes:
    - path: /github
      source: { $ref: triggers.github }
      on: { $ref: routes.review }
```

Suivez [le déploiement des webhooks](../operating-webhooks/) pour HTTPS public et la configuration du service émetteur. L’identité vérifiée de l’émetteur n’autorise pas les approbations. GitLab, Slack et Standard Webhooks utilisent leurs propres composants source.

## Attendre un résultat en file

Une recette peut utiliser une tâche `queued` pour attendre le résultat d’un handler. Voir [defineQueuedTask](../../reference/definequeuedtask/) pour le polling, l’annulation, les quotas et la consommation ; déclarez les références de file dans la configuration et construisez la requête avec `arguments`.

Les tests locaux et Redis réel couvrent la composition des services. Redis hébergé, les webhooks publics et la restauration cloud demandent une validation séparée.

<!-- Retained section anchors for existing bookmarks. -->

<span id="déclarer-une-file-et-un-job-de-recette"></span>
<span id="démarrer-un-worker-explicitement"></span>
<span id="publier-sur-cron-ou-webhook-authentifié"></span>
<span id="attendre-un-job-depuis-une-recette"></span>
<span id="workspaces-de-fichiers"></span>
