---
title: "Suivre l’exécution d’une recette"
description: "Ajoutez des événements ou un rapport final à votre configuration d’exécution."
---

Ajoutez des événements ou un rapport final à votre [configuration d’exécution](../recipe-configuration/). Gardez la version 3 du tutoriel local.

## Déclarer l’observation et les rapports finaux

Utilisez cette configuration complète avec la recette du tutoriel pour voir les événements et le rapport final. Une exécution réussie sans sortie déclarée est silencieuse. Les erreurs restent sur stderr ; `--json` sélectionne explicitement un rapport final JSON et remplace les rapports configurés pour cette invocation.

```yaml title="outpost.yaml — observation et rapports"
version: 3
workspace: { kind: ephemeral }
sandbox:
  provider: local
observation:
  sinks:
    - type: console
      format: json
reports:
  - type: json
    stream: stdout
```

Le récepteur console écrit les événements sur stderr par défaut. Le rapport final paraît après nettoyage de la sandbox et des composants. Omettez `reports` pour recevoir les événements sans rendu final ; omettez `observation` pour demander seulement le rapport final.

## Déclarer les rapports et la télémétrie

Un récepteur console suffit pour afficher les événements usuels. Pour la télémétrie, remplacez `observation` et `reports` par les blocs suivants et déclarez les extensions de tracer et meter. OpenTelemetry emprunte un tracer et un meter hôtes à des extensions déclarées ; seul l’observateur est fermé et l’intégration optionnelle est chargée lorsqu’elle est utilisée.

```yaml title="outpost.yaml — télémétrie"
observation:
  scope: { executionId: review }
  sinks:
    - type: reporter
      label: review
    - type: opentelemetry
      tracer: { $ref: extensions.tracer }
      meter: { $ref: extensions.meter }
reports:
  - type: json
    stream: stdout
```

Un reporter personnalisé utilise `type: custom` et des `handlers` nommés, chacun référençant une fonction avec son contrat, par exemple `sink.custom.handlers.summary`. Le hub partagé accompagne allocation, tâches, agents, intégration et nettoyage avec leurs scopes. Les récepteurs possédés sont vidés après les ressources observées. Les objets empruntés restent à la charge de leur propriétaire ; les erreurs d’observateurs ne changent pas le résultat. Sans observation ni rapport déclaré, une exécution réussie reste silencieuse ; `--json` demande explicitement un rapport final unique.

## Enregistrer et lire l’état d’exécution

Ajoutez un transport et référencez-le directement depuis l’observation. Le composant par défaut est `client` ; `type: hub` reste disponible pour une composition élémentaire explicite. Utilisez cette configuration complète avec la recette du tutoriel. Chaque exécution reçoit un identifiant d’observation généré, renvoyé dans le champ `observationId` du rapport final. Pour le choisir à l’avance, ajoutez `runId: review-123` dans la section `workflow` de la recette, avec un identifiant neuf pour chaque exécution indépendante.

```yaml title="outpost.yaml — observation persistante"
version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
transports:
  runs:
    type: local
    directory: ./.outpost/storage
observation:
  type: client
  transporter: { $ref: transports.runs }
  sinks:
    - type: reporter
      label: review
reports:
  - type: json
```

Le moteur crée l’enregistrement et arrête son heartbeat lorsque le workflow se stabilise. Avec un checkpoint, son identifiant est utilisé par défaut et un historique d’observation stabilisé reprend automatiquement. Après récupération explicite d’une exécution interrompue, choisissez un nouveau `workflow.runId` si l’observation précédente est encore active. Ni l’observation ni la lecture n’autorisent la récupération.

Reprenez le `observationId` du rapport avec `createObservation({ transporter })`, puis appelez `observation.readRun(id)` ou `observation.watchRun(id)` comme dans le guide de [l’état d’exécution](../run-state/). La projection couvre le workflow et ses tâches contextualisées ; l’allocation préalable ainsi que l’intégration et le nettoyage ultérieurs atteignent toujours les sorties configurées, mais restent hors de sa projection persistante. Le rapport final de recette couvre aussi ces dernières étapes. Le composant historique `sink.run` conserve sa propriété manuelle pour une seule exécution ; ne le combinez pas avec la persistance automatique du même identifiant.

Le champ `runId` du rapport reste l’identifiant du checkpoint pour les commandes de reprise ; `observationId` désigne le suivi, qui peut changer après récupération.
