---
title: Composants YAML disponibles
description: Correspondance générée entre les composants YAML, leurs contrats TypeScript et leur propriété.
---

Ces déclarations proviennent du registre utilisé pour valider et exécuter les recettes. Déclarez un composant avec `type` ou réutilisez-le avec `$ref` depuis la configuration locale. Le guide [des recettes YAML](../yaml-recipes/) explique les familles et les extensions ; les [compositions avancées](../recipe-advanced/) présentent la spéculation et les résolveurs.

Les identifiants se lisent `catégorie.type`. Les lignes `*Options.options` représentent les sections du document : `workflow`, `workspace`, `integration` ou les options d’une tâche. Les propriétés détaillées restent celles des contrats TypeScript liés depuis les guides. Le schéma de l’éditeur et `recipes/components.json` répertorient leurs champs et les références de callbacks.

Un composant indiqué « runtime » est fermé par le runtime ; « valeur » désigne une configuration, une factory sans ressource ouverte ou un objet sans fermeture propre. Les dépendances possédées sont fermées en ordre inverse, les observateurs en dernier. Un export emprunté reste toujours à la charge de son propriétaire. L’activation expérimentale exige `experimental: true` dans la configuration.

| Identifiant                   | Catégorie             | Fermeture | Lot | Statut       |
| ----------------------------- | --------------------- | --------- | --- | ------------ |
| `agent.composed`              | `agent`               | valeur    | 2   | implémenté   |
| `agent.fallback`              | `agent`               | valeur    | 3   | implémenté   |
| `agent.replay`                | `agent`               | valeur    | 3   | implémenté   |
| `artifact.binary`             | `artifact`            | valeur    | 5   | implémenté   |
| `artifact.json`               | `artifact`            | valeur    | 5   | implémenté   |
| `artifactStore.transport`     | `artifactStore`       | valeur    | 5   | implémenté   |
| `artifactTaskOptions.options` | `artifactTaskOptions` | valeur    | 5   | implémenté   |
| `callOptions.options`         | `callOptions`         | valeur    | 4   | implémenté   |
| `checkpointStore.transport`   | `checkpointStore`     | valeur    | 5   | implémenté   |
| `context.custom`              | `context`             | valeur    | 3   | implémenté   |
| `context.summarize`           | `context`             | valeur    | 3   | implémenté   |
| `context.truncate`            | `context`             | valeur    | 3   | implémenté   |
| `conversations.bundle`        | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.claude`        | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.codex`         | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.copilot`       | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.harness`       | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.kimi`          | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.transcript`    | `conversations`       | valeur    | 3   | implémenté   |
| `conversations.transport`     | `conversations`       | valeur    | 3   | implémenté   |
| `cron.schedule`               | `cron`                | valeur    | 6   | implémenté   |
| `decision.questions`          | `decision`            | valeur    | 3   | implémenté   |
| `decisionProvider.system-one` | `decisionProvider`    | valeur    | 3   | implémenté   |
| `decisionTaskOptions.options` | `decisionTaskOptions` | valeur    | 4   | implémenté   |
| `dispatchOptions.options`     | `dispatchOptions`     | valeur    | 3   | implémenté   |
| `gateOptions.options`         | `gateOptions`         | valeur    | 5   | implémenté   |
| `harness.agy`                 | `harness`             | valeur    | 2   | implémenté   |
| `harness.claude`              | `harness`             | valeur    | 2   | implémenté   |
| `harness.codex`               | `harness`             | valeur    | 2   | implémenté   |
| `harness.copilot`             | `harness`             | valeur    | 2   | implémenté   |
| `harness.kimi`                | `harness`             | valeur    | 2   | implémenté   |
| `harness.outpost`             | `harness`             | valeur    | 3   | implémenté   |
| `hook.custom`                 | `hook`                | valeur    | 3   | implémenté   |
| `instructions.mcp`            | `instructions`        | valeur    | 3   | implémenté   |
| `instructions.source`         | `instructions`        | valeur    | 3   | implémenté   |
| `integrationOptions.options`  | `integrationOptions`  | valeur    | 7   | implémenté   |
| `interactiveOptions.options`  | `interactiveOptions`  | valeur    | 5   | implémenté   |
| `isolatedOptions.options`     | `isolatedOptions`     | valeur    | 4   | implémenté   |
| `job.recipe`                  | `job`                 | valeur    | 6   | implémenté   |
| `job.workflow`                | `job`                 | valeur    | 6   | implémenté   |
| `loopOptions.options`         | `loopOptions`         | valeur    | 4   | implémenté   |
| `modelProvider.anthropic`     | `modelProvider`       | valeur    | 3   | implémenté   |
| `modelProvider.openai`        | `modelProvider`       | valeur    | 3   | implémenté   |
| `observation.hub`             | `observation`         | runtime   | 1   | implémenté   |
| `permissions.rules`           | `permissions`         | valeur    | 3   | implémenté   |
| `profile.portable`            | `profile`             | valeur    | 2   | implémenté   |
| `queue.bullmq`                | `queue`               | runtime   | 6   | implémenté   |
| `queue.http`                  | `queue`               | valeur    | 6   | implémenté   |
| `queue.sqlite`                | `queue`               | runtime   | 6   | implémenté   |
| `queuedOptions.options`       | `queuedOptions`       | valeur    | 6   | implémenté   |
| `resolver.agent`              | `resolver`            | valeur    | 7   | implémenté   |
| `response.json`               | `response`            | valeur    | 3   | implémenté   |
| `response.text`               | `response`            | valeur    | 3   | implémenté   |
| `routing.decision`            | `routing`             | valeur    | 3   | implémenté   |
| `sandboxOptions.options`      | `sandboxOptions`      | valeur    | 2   | implémenté   |
| `sandboxProvider.daytona`     | `sandboxProvider`     | valeur    | 2   | implémenté   |
| `sandboxProvider.docker`      | `sandboxProvider`     | valeur    | 2   | implémenté   |
| `sandboxProvider.firecracker` | `sandboxProvider`     | valeur    | 2   | expérimental |
| `sandboxProvider.local`       | `sandboxProvider`     | valeur    | 2   | implémenté   |
| `sandboxProvider.mounted`     | `sandboxProvider`     | valeur    | 7   | implémenté   |
| `sandboxProvider.podman`      | `sandboxProvider`     | valeur    | 2   | implémenté   |
| `sandboxProvider.remote`      | `sandboxProvider`     | valeur    | 7   | implémenté   |
| `sandboxProvider.vercel`      | `sandboxProvider`     | valeur    | 2   | implémenté   |
| `schedule.cron`               | `schedule`            | valeur    | 6   | implémenté   |
| `secretSource.aws`            | `secretSource`        | valeur    | 2   | implémenté   |
| `secretSource.azure`          | `secretSource`        | valeur    | 2   | implémenté   |
| `secretSource.gcp`            | `secretSource`        | valeur    | 2   | implémenté   |
| `secretSource.infisical`      | `secretSource`        | valeur    | 2   | implémenté   |
| `secretSource.onepassword`    | `secretSource`        | valeur    | 2   | implémenté   |
| `secretSource.vault`          | `secretSource`        | valeur    | 2   | implémenté   |
| `service.queue`               | `service`             | valeur    | 6   | implémenté   |
| `service.schedules`           | `service`             | valeur    | 6   | implémenté   |
| `service.triggers`            | `service`             | valeur    | 6   | implémenté   |
| `service.worker`              | `service`             | valeur    | 6   | implémenté   |
| `sink.console`                | `sink`                | valeur    | 1   | implémenté   |
| `sink.custom`                 | `sink`                | runtime   | 7   | implémenté   |
| `sink.opentelemetry`          | `sink`                | runtime   | 7   | implémenté   |
| `sink.reporter`               | `sink`                | valeur    | 7   | implémenté   |
| `sink.run`                    | `sink`                | runtime   | 5   | implémenté   |
| `skill.custom`                | `skill`               | valeur    | 3   | implémenté   |
| `speculationOptions.options`  | `speculationOptions`  | valeur    | 7   | expérimental |
| `steering.controller`         | `steering`            | valeur    | 3   | implémenté   |
| `taskCacheStore.transport`    | `taskCacheStore`      | valeur    | 5   | implémenté   |
| `taskOptions.options`         | `taskOptions`         | valeur    | 4   | implémenté   |
| `tool.custom`                 | `tool`                | valeur    | 3   | implémenté   |
| `tool.subagent`               | `tool`                | valeur    | 3   | implémenté   |
| `toolset.custom`              | `toolset`             | valeur    | 3   | implémenté   |
| `toolset.edit`                | `toolset`             | valeur    | 3   | implémenté   |
| `toolset.files`               | `toolset`             | valeur    | 3   | implémenté   |
| `toolset.git`                 | `toolset`             | valeur    | 3   | implémenté   |
| `toolset.search`              | `toolset`             | valeur    | 3   | implémenté   |
| `toolset.shell`               | `toolset`             | valeur    | 3   | implémenté   |
| `transport.local`             | `transport`           | valeur    | 2   | implémenté   |
| `transport.s3`                | `transport`           | valeur    | 5   | implémenté   |
| `triggerMapper.job`           | `triggerMapper`       | valeur    | 6   | implémenté   |
| `triggerSource.github`        | `triggerSource`       | valeur    | 6   | implémenté   |
| `triggerSource.gitlab`        | `triggerSource`       | valeur    | 6   | implémenté   |
| `triggerSource.slack`         | `triggerSource`       | valeur    | 6   | implémenté   |
| `triggerSource.standard`      | `triggerSource`       | valeur    | 6   | implémenté   |
| `variables.secrets`           | `variables`           | valeur    | 2   | implémenté   |
| `verifier.ed25519`            | `verifier`            | valeur    | 5   | implémenté   |
| `workflowOptions.options`     | `workflowOptions`     | valeur    | 4   | implémenté   |

La couverture décrit la composition locale, pas une validation de chaque service distant. Les tests utilisent des agents simulés, des modèles HTTP locaux, Git, Docker et Redis réels ; les appels payants, clouds et gestionnaires de secrets distants restent sans validation live.
