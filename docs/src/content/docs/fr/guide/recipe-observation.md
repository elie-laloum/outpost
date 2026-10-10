---
title: "Suivre l’exécution d’une recette"
description: "Ajoutez des événements ou un rapport final à votre configuration d’exécution."
---

Ajoutez des événements ou un rapport final à votre [configuration d’exécution](../recipe-configuration/). Utilisez la version 2 ou suivante de cette configuration.

## Déclarer l’observation et les rapports finaux

La configuration version 2 peut attacher un hub à l’allocation, aux tâches, à l’activité des agents et au nettoyage. Une exécution réussie sans sortie déclarée est silencieuse. Les erreurs restent sur stderr ; `--json` sélectionne explicitement un rapport final JSON et remplace les rapports configurés pour cette invocation.

```yaml title="outpost.yaml — observation et rapports"
version: 2
repository: .
sandbox:
  provider: docker
  image: outpost:dev
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

Un récepteur console suffit pour afficher les événements usuels. Les reporters texte existants, les gestionnaires personnalisés et OpenTelemetry se composent aussi comme récepteurs. OpenTelemetry emprunte un tracer et un meter hôtes à des extensions déclarées ; seul l’observateur est fermé et l’intégration optionnelle est chargée lorsqu’elle est utilisée.

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
