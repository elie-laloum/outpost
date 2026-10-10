---
title: Composants YAML disponibles
description: Correspondance générée entre les composants YAML, leurs contrats TypeScript et leur propriété.
---

Ces déclarations proviennent du registre utilisé pour valider et exécuter les recettes. Déclarez un composant avec `type` ou réutilisez-le avec `$ref` depuis la configuration locale. La [configuration des recettes](../recipe-configuration/) explique les familles et les [extensions locales](../recipe-extensions/) ; les [compositions avancées](../recipe-advanced/) présentent la spéculation et les résolveurs.

Les identifiants se lisent `catégorie.type`. Les lignes `*Options.options` représentent les sections du document : `workflow`, `workspace`, `integration` ou les options d’une tâche. Les propriétés détaillées restent celles des contrats TypeScript liés depuis les guides. Le schéma de l’éditeur et `recipes/components.json` répertorient leurs champs et les références de callbacks.

Un composant indiqué « runtime » est fermé par le runtime ; « valeur » désigne une configuration, une factory sans ressource ouverte ou un objet sans fermeture propre. Les dépendances possédées sont fermées en ordre inverse, les observateurs en dernier. Un export emprunté reste toujours à la charge de son propriétaire. L’activation expérimentale exige `experimental: true` dans la configuration.

## Agents et boucles de modèle

| Identifiant                | Contrat                                                                         | Fermeture | Statut     |
| -------------------------- | ------------------------------------------------------------------------------- | --------- | ---------- |
| `agent.composed`           | [AgentOptions](../../reference/agentoptions/)                                   | valeur    | implémenté |
| `agent.fallback`           | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `agent.replay`             | [ReplayAgentOptions](../../reference/replayagentoptions/)                       | valeur    | implémenté |
| `context.custom`           | [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/) | valeur    | implémenté |
| `context.summarize`        | [SummarizeHistoryOptions](../../reference/summarizehistoryoptions/)             | valeur    | implémenté |
| `context.truncate`         | [TruncateToolResultsOptions](../../reference/truncatetoolresultsoptions/)       | valeur    | implémenté |
| `conversations.bundle`     | [SessionBundleProfile](../../reference/sessionbundleprofile/)                   | valeur    | implémenté |
| `conversations.claude`     | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `conversations.codex`      | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `conversations.copilot`    | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `conversations.harness`    | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `conversations.kimi`       | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `conversations.transcript` | [TranscriptConversationLayout](../../reference/transcriptconversationlayout/)   | valeur    | implémenté |
| `conversations.transport`  | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `harness.agy`              | [AntigravitySettings](../../reference/antigravitysettings/)                     | valeur    | implémenté |
| `harness.claude`           | [ClaudeSettings](../../reference/claudesettings/)                               | valeur    | implémenté |
| `harness.codex`            | [CodexSettings](../../reference/codexsettings/)                                 | valeur    | implémenté |
| `harness.copilot`          | [CopilotSettings](../../reference/copilotsettings/)                             | valeur    | implémenté |
| `harness.kimi`             | [KimiSettings](../../reference/kimisettings/)                                   | valeur    | implémenté |
| `harness.outpost`          | [HarnessOptions](../../reference/customharnessoptions/)                         | valeur    | implémenté |
| `instructions.mcp`         | [McpPromptOptions](../../reference/mcppromptoptions/)                           | valeur    | implémenté |
| `instructions.source`      | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `modelProvider.anthropic`  | [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/) | valeur    | implémenté |
| `modelProvider.openai`     | [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/)       | valeur    | implémenté |
| `profile.portable`         | [AgentProfileOptions](../../reference/agentprofileoptions/)                     | valeur    | implémenté |
| `response.json`            | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `response.text`            | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `routing.decision`         | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |
| `steering.controller`      | [Configuration YAML](../recipe-configuration/)                                  | valeur    | implémenté |

## Outils et permissions

| Identifiant         | Contrat                                                                 | Fermeture | Statut     |
| ------------------- | ----------------------------------------------------------------------- | --------- | ---------- |
| `hook.custom`       | [HarnessHookOptions](../../reference/harnesshookoptions/)               | valeur    | implémenté |
| `permissions.rules` | [HarnessPermissionsOptions](../../reference/harnesspermissionsoptions/) | valeur    | implémenté |
| `skill.custom`      | [HarnessSkillOptions](../../reference/harnessskilloptions/)             | valeur    | implémenté |
| `tool.custom`       | [HarnessToolOptions](../../reference/harnesstooloptions/)               | valeur    | implémenté |
| `tool.subagent`     | [HarnessSubagentOptions](../../reference/harnesssubagentoptions/)       | valeur    | implémenté |
| `toolset.custom`    | [HarnessToolsetOptions](../../reference/harnesstoolsetoptions/)         | valeur    | implémenté |
| `toolset.edit`      | [Configuration YAML](../recipe-configuration/)                          | valeur    | implémenté |
| `toolset.files`     | [FileSelectionOptions](../../reference/fileselectionoptions/)           | valeur    | implémenté |
| `toolset.git`       | [Configuration YAML](../recipe-configuration/)                          | valeur    | implémenté |
| `toolset.search`    | [FileSelectionOptions](../../reference/fileselectionoptions/)           | valeur    | implémenté |
| `toolset.shell`     | [ShellToolsOptions](../../reference/shelltoolsoptions/)                 | valeur    | implémenté |

## Exécution et secrets

| Identifiant                   | Contrat                                                                           | Fermeture | Statut       |
| ----------------------------- | --------------------------------------------------------------------------------- | --------- | ------------ |
| `sandboxOptions.options`      | [SandboxOptions](../../reference/sandboxoptions/)                                 | valeur    | implémenté   |
| `sandboxProvider.daytona`     | [DaytonaOptions](../../reference/daytonaoptions/)                                 | valeur    | implémenté   |
| `sandboxProvider.docker`      | [ContainerOptions](../../reference/containeroptions/)                             | valeur    | implémenté   |
| `sandboxProvider.firecracker` | [FirecrackerOptions](../../reference/firecrackeroptions/)                         | valeur    | expérimental |
| `sandboxProvider.local`       | [Configuration YAML](../recipe-configuration/)                                    | valeur    | implémenté   |
| `sandboxProvider.mounted`     | [Configuration YAML](../recipe-configuration/)                                    | valeur    | implémenté   |
| `sandboxProvider.podman`      | [ContainerOptions](../../reference/containeroptions/)                             | valeur    | implémenté   |
| `sandboxProvider.remote`      | [Configuration YAML](../recipe-configuration/)                                    | valeur    | implémenté   |
| `sandboxProvider.vercel`      | [VercelOptions](../../reference/verceloptions/)                                   | valeur    | implémenté   |
| `secretSource.aws`            | [AwsSecretSourceOptions](../../reference/awssecretsourceoptions/)                 | valeur    | implémenté   |
| `secretSource.azure`          | [AzureSecretSourceOptions](../../reference/azuresecretsourceoptions/)             | valeur    | implémenté   |
| `secretSource.gcp`            | [GcpSecretSourceOptions](../../reference/gcpsecretsourceoptions/)                 | valeur    | implémenté   |
| `secretSource.infisical`      | [InfisicalSecretSourceOptions](../../reference/infisicalsecretsourceoptions/)     | valeur    | implémenté   |
| `secretSource.onepassword`    | [OnePasswordSecretSourceOptions](../../reference/onepasswordsecretsourceoptions/) | valeur    | implémenté   |
| `secretSource.vault`          | [VaultSecretSourceOptions](../../reference/vaultsecretsourceoptions/)             | valeur    | implémenté   |
| `variables.secrets`           | [Configuration YAML](../recipe-configuration/)                                    | valeur    | implémenté   |

## Stockage et observation

| Identifiant                 | Contrat                                                             | Fermeture | Statut     |
| --------------------------- | ------------------------------------------------------------------- | --------- | ---------- |
| `artifact.binary`           | [ArtifactContractOptions](../../reference/artifactcontractoptions/) | valeur    | implémenté |
| `artifact.json`             | [Configuration YAML](../recipe-configuration/)                      | valeur    | implémenté |
| `artifactStore.transport`   | [ArtifactStoreOptions](../../reference/artifactstoreoptions/)       | valeur    | implémenté |
| `checkpointStore.transport` | [TransportStoreOptions](../../reference/transportstoreoptions/)     | valeur    | implémenté |
| `observation.hub`           | [ObservationHubOptions](../../reference/observationhuboptions/)     | runtime   | implémenté |
| `sink.console`              | [Configuration YAML](../recipe-configuration/)                      | valeur    | implémenté |
| `sink.custom`               | [Configuration YAML](../recipe-configuration/)                      | runtime   | implémenté |
| `sink.opentelemetry`        | [OpenTelemetryOptions](../../reference/opentelemetryoptions/)       | runtime   | implémenté |
| `sink.reporter`             | [ReporterOptions](../../reference/reporteroptions/)                 | valeur    | implémenté |
| `sink.run`                  | [RunObserverOptions](../../reference/runobserveroptions/)           | runtime   | implémenté |
| `taskCacheStore.transport`  | [TaskCacheStoreOptions](../../reference/taskcachestoreoptions/)     | valeur    | implémenté |
| `transport.local`           | [LocalTransportOptions](../../reference/localtransportoptions/)     | valeur    | implémenté |
| `transport.s3`              | [S3TransportOptions](../../reference/s3transportoptions/)           | valeur    | implémenté |

## Files et déclencheurs

| Identifiant              | Contrat                                                           | Fermeture | Statut     |
| ------------------------ | ----------------------------------------------------------------- | --------- | ---------- |
| `cron.schedule`          | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `job.recipe`             | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `job.workflow`           | [WorkflowJobOptions](../../reference/workflowjoboptions/)         | valeur    | implémenté |
| `queue.bullmq`           | [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/) | runtime   | implémenté |
| `queue.http`             | [QueueClientOptions](../../reference/queueclientoptions/)         | valeur    | implémenté |
| `queue.sqlite`           | [Configuration YAML](../recipe-configuration/)                    | runtime   | implémenté |
| `schedule.cron`          | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `service.queue`          | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `service.schedules`      | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `service.triggers`       | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `service.worker`         | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `triggerMapper.job`      | [Configuration YAML](../recipe-configuration/)                    | valeur    | implémenté |
| `triggerSource.github`   | [GithubWebhookOptions](../../reference/githubwebhookoptions/)     | valeur    | implémenté |
| `triggerSource.gitlab`   | [GitlabWebhookOptions](../../reference/gitlabwebhookoptions/)     | valeur    | implémenté |
| `triggerSource.slack`    | [SlackRequestOptions](../../reference/slackrequestoptions/)       | valeur    | implémenté |
| `triggerSource.standard` | [StandardWebhookOptions](../../reference/standardwebhookoptions/) | valeur    | implémenté |

## Décisions et intégration

| Identifiant                   | Contrat                                                                               | Fermeture | Statut     |
| ----------------------------- | ------------------------------------------------------------------------------------- | --------- | ---------- |
| `decision.questions`          | [DecisionOptions](../../reference/decisionoptions/)                                   | valeur    | implémenté |
| `decisionProvider.system-one` | [SystemOneDecisionProviderOptions](../../reference/systemonedecisionprovideroptions/) | valeur    | implémenté |
| `resolver.agent`              | [Configuration YAML](../recipe-configuration/)                                        | valeur    | implémenté |
| `verifier.ed25519`            | [WorkflowDecisionVerifierOptions](../../reference/workflowdecisionverifieroptions/)   | valeur    | implémenté |

## Options de tâches et workflows

| Identifiant                   | Contrat                                        | Fermeture | Statut       |
| ----------------------------- | ---------------------------------------------- | --------- | ------------ |
| `artifactTaskOptions.options` | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `callOptions.options`         | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `decisionTaskOptions.options` | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `dispatchOptions.options`     | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `gateOptions.options`         | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `integrationOptions.options`  | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `interactiveOptions.options`  | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `isolatedOptions.options`     | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `loopOptions.options`         | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `queuedOptions.options`       | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `speculationOptions.options`  | [Configuration YAML](../recipe-configuration/) | valeur    | expérimental |
| `taskOptions.options`         | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |
| `workflowOptions.options`     | [Configuration YAML](../recipe-configuration/) | valeur    | implémenté   |

La couverture décrit la composition locale, pas une validation de chaque service distant. Les tests utilisent des agents simulés, des modèles HTTP locaux, Git, Docker et Redis réels ; les appels payants, clouds et gestionnaires de secrets distants restent sans validation live.
