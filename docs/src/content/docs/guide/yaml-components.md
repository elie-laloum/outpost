---
title: Available YAML components
description: Generated mapping of YAML components, TypeScript contracts and ownership.
---

These declarations come from the registry used to validate and execute recipes. Declare a component with `type` or reuse it with `$ref` from local configuration. The [recipe configuration guide](../recipe-configuration/) explains families and [local extensions](../recipe-extensions/); [advanced composition](../recipe-advanced/) covers speculation and resolvers.

Identifiers read as `category.type`. The `*Options.options` rows represent document sections: `workflow`, `workspace`, `integration` or task options. Detailed properties retain the TypeScript contracts linked from the guides. The editor schema and `recipes/components.json` list their fields and callback references.

A component marked “runtime” is closed by the runtime; “value” denotes configuration, an allocation-free factory or an object without its own cleanup. Owned dependencies close in reverse order, with observers last. Borrowed exports always remain caller-owned. Experimental activation requires `experimental: true` in configuration.

## Agents and model loops

| Identifier                 | Contract                                                                        | Cleanup | Status      |
| -------------------------- | ------------------------------------------------------------------------------- | ------- | ----------- |
| `agent.composed`           | [AgentOptions](../../reference/agentoptions/)                                   | value   | implemented |
| `agent.fallback`           | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `agent.replay`             | [ReplayAgentOptions](../../reference/replayagentoptions/)                       | value   | implemented |
| `context.custom`           | [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/) | value   | implemented |
| `context.summarize`        | [SummarizeHistoryOptions](../../reference/summarizehistoryoptions/)             | value   | implemented |
| `context.truncate`         | [TruncateToolResultsOptions](../../reference/truncatetoolresultsoptions/)       | value   | implemented |
| `conversations.bundle`     | [SessionBundleProfile](../../reference/sessionbundleprofile/)                   | value   | implemented |
| `conversations.claude`     | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `conversations.codex`      | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `conversations.copilot`    | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `conversations.harness`    | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `conversations.kimi`       | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `conversations.transcript` | [TranscriptConversationLayout](../../reference/transcriptconversationlayout/)   | value   | implemented |
| `conversations.transport`  | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `harness.agy`              | [AntigravitySettings](../../reference/antigravitysettings/)                     | value   | implemented |
| `harness.claude`           | [ClaudeSettings](../../reference/claudesettings/)                               | value   | implemented |
| `harness.codex`            | [CodexSettings](../../reference/codexsettings/)                                 | value   | implemented |
| `harness.copilot`          | [CopilotSettings](../../reference/copilotsettings/)                             | value   | implemented |
| `harness.kimi`             | [KimiSettings](../../reference/kimisettings/)                                   | value   | implemented |
| `harness.outpost`          | [HarnessOptions](../../reference/customharnessoptions/)                         | value   | implemented |
| `instructions.mcp`         | [McpPromptOptions](../../reference/mcppromptoptions/)                           | value   | implemented |
| `instructions.source`      | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `modelProvider.anthropic`  | [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/) | value   | implemented |
| `modelProvider.openai`     | [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/)       | value   | implemented |
| `profile.portable`         | [AgentProfileOptions](../../reference/agentprofileoptions/)                     | value   | implemented |
| `response.json`            | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `response.text`            | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `routing.decision`         | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |
| `steering.controller`      | [YAML configuration](../recipe-configuration/)                                  | value   | implemented |

## Tools and permissions

| Identifier          | Contract                                                                | Cleanup | Status      |
| ------------------- | ----------------------------------------------------------------------- | ------- | ----------- |
| `hook.custom`       | [HarnessHookOptions](../../reference/harnesshookoptions/)               | value   | implemented |
| `permissions.rules` | [HarnessPermissionsOptions](../../reference/harnesspermissionsoptions/) | value   | implemented |
| `skill.custom`      | [HarnessSkillOptions](../../reference/harnessskilloptions/)             | value   | implemented |
| `tool.custom`       | [HarnessToolOptions](../../reference/harnesstooloptions/)               | value   | implemented |
| `tool.subagent`     | [HarnessSubagentOptions](../../reference/harnesssubagentoptions/)       | value   | implemented |
| `toolset.custom`    | [HarnessToolsetOptions](../../reference/harnesstoolsetoptions/)         | value   | implemented |
| `toolset.edit`      | [YAML configuration](../recipe-configuration/)                          | value   | implemented |
| `toolset.files`     | [FileSelectionOptions](../../reference/fileselectionoptions/)           | value   | implemented |
| `toolset.git`       | [YAML configuration](../recipe-configuration/)                          | value   | implemented |
| `toolset.search`    | [FileSelectionOptions](../../reference/fileselectionoptions/)           | value   | implemented |
| `toolset.shell`     | [ShellToolsOptions](../../reference/shelltoolsoptions/)                 | value   | implemented |

## Execution and secrets

| Identifier                    | Contract                                                                          | Cleanup | Status       |
| ----------------------------- | --------------------------------------------------------------------------------- | ------- | ------------ |
| `sandboxOptions.options`      | [SandboxOptions](../../reference/sandboxoptions/)                                 | value   | implemented  |
| `sandboxProvider.daytona`     | [DaytonaOptions](../../reference/daytonaoptions/)                                 | value   | implemented  |
| `sandboxProvider.docker`      | [ContainerOptions](../../reference/containeroptions/)                             | value   | implemented  |
| `sandboxProvider.firecracker` | [FirecrackerOptions](../../reference/firecrackeroptions/)                         | value   | experimental |
| `sandboxProvider.local`       | [YAML configuration](../recipe-configuration/)                                    | value   | implemented  |
| `sandboxProvider.mounted`     | [YAML configuration](../recipe-configuration/)                                    | value   | implemented  |
| `sandboxProvider.podman`      | [ContainerOptions](../../reference/containeroptions/)                             | value   | implemented  |
| `sandboxProvider.remote`      | [YAML configuration](../recipe-configuration/)                                    | value   | implemented  |
| `sandboxProvider.vercel`      | [VercelOptions](../../reference/verceloptions/)                                   | value   | implemented  |
| `secretSource.aws`            | [AwsSecretSourceOptions](../../reference/awssecretsourceoptions/)                 | value   | implemented  |
| `secretSource.azure`          | [AzureSecretSourceOptions](../../reference/azuresecretsourceoptions/)             | value   | implemented  |
| `secretSource.gcp`            | [GcpSecretSourceOptions](../../reference/gcpsecretsourceoptions/)                 | value   | implemented  |
| `secretSource.infisical`      | [InfisicalSecretSourceOptions](../../reference/infisicalsecretsourceoptions/)     | value   | implemented  |
| `secretSource.onepassword`    | [OnePasswordSecretSourceOptions](../../reference/onepasswordsecretsourceoptions/) | value   | implemented  |
| `secretSource.vault`          | [VaultSecretSourceOptions](../../reference/vaultsecretsourceoptions/)             | value   | implemented  |
| `variables.secrets`           | [YAML configuration](../recipe-configuration/)                                    | value   | implemented  |

## Storage and observation

| Identifier                  | Contract                                                            | Cleanup | Status      |
| --------------------------- | ------------------------------------------------------------------- | ------- | ----------- |
| `artifact.binary`           | [ArtifactContractOptions](../../reference/artifactcontractoptions/) | value   | implemented |
| `artifact.json`             | [YAML configuration](../recipe-configuration/)                      | value   | implemented |
| `artifactStore.transport`   | [ArtifactStoreOptions](../../reference/artifactstoreoptions/)       | value   | implemented |
| `checkpointStore.transport` | [TransportStoreOptions](../../reference/transportstoreoptions/)     | value   | implemented |
| `observation.hub`           | [ObservationHubOptions](../../reference/observationhuboptions/)     | runtime | implemented |
| `sink.console`              | [YAML configuration](../recipe-configuration/)                      | value   | implemented |
| `sink.custom`               | [YAML configuration](../recipe-configuration/)                      | runtime | implemented |
| `sink.opentelemetry`        | [OpenTelemetryOptions](../../reference/opentelemetryoptions/)       | runtime | implemented |
| `sink.reporter`             | [ReporterOptions](../../reference/reporteroptions/)                 | value   | implemented |
| `sink.run`                  | [RunObserverOptions](../../reference/runobserveroptions/)           | runtime | implemented |
| `taskCacheStore.transport`  | [TaskCacheStoreOptions](../../reference/taskcachestoreoptions/)     | value   | implemented |
| `transport.local`           | [LocalTransportOptions](../../reference/localtransportoptions/)     | value   | implemented |
| `transport.s3`              | [S3TransportOptions](../../reference/s3transportoptions/)           | value   | implemented |

## Queues and triggers

| Identifier               | Contract                                                          | Cleanup | Status      |
| ------------------------ | ----------------------------------------------------------------- | ------- | ----------- |
| `cron.schedule`          | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `job.recipe`             | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `job.workflow`           | [WorkflowJobOptions](../../reference/workflowjoboptions/)         | value   | implemented |
| `queue.bullmq`           | [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/) | runtime | implemented |
| `queue.http`             | [QueueClientOptions](../../reference/queueclientoptions/)         | value   | implemented |
| `queue.sqlite`           | [YAML configuration](../recipe-configuration/)                    | runtime | implemented |
| `schedule.cron`          | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `service.queue`          | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `service.schedules`      | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `service.triggers`       | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `service.worker`         | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `triggerMapper.job`      | [YAML configuration](../recipe-configuration/)                    | value   | implemented |
| `triggerSource.github`   | [GithubWebhookOptions](../../reference/githubwebhookoptions/)     | value   | implemented |
| `triggerSource.gitlab`   | [GitlabWebhookOptions](../../reference/gitlabwebhookoptions/)     | value   | implemented |
| `triggerSource.slack`    | [SlackRequestOptions](../../reference/slackrequestoptions/)       | value   | implemented |
| `triggerSource.standard` | [StandardWebhookOptions](../../reference/standardwebhookoptions/) | value   | implemented |

## Decisions and integration

| Identifier                    | Contract                                                                              | Cleanup | Status      |
| ----------------------------- | ------------------------------------------------------------------------------------- | ------- | ----------- |
| `decision.questions`          | [DecisionOptions](../../reference/decisionoptions/)                                   | value   | implemented |
| `decisionProvider.system-one` | [SystemOneDecisionProviderOptions](../../reference/systemonedecisionprovideroptions/) | value   | implemented |
| `resolver.agent`              | [YAML configuration](../recipe-configuration/)                                        | value   | implemented |
| `verifier.ed25519`            | [WorkflowDecisionVerifierOptions](../../reference/workflowdecisionverifieroptions/)   | value   | implemented |

## Task and workflow options

| Identifier                    | Contract                                       | Cleanup | Status       |
| ----------------------------- | ---------------------------------------------- | ------- | ------------ |
| `artifactTaskOptions.options` | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `callOptions.options`         | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `decisionTaskOptions.options` | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `dispatchOptions.options`     | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `gateOptions.options`         | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `integrationOptions.options`  | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `interactiveOptions.options`  | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `isolatedOptions.options`     | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `loopOptions.options`         | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `queuedOptions.options`       | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `speculationOptions.options`  | [YAML configuration](../recipe-configuration/) | value   | experimental |
| `taskOptions.options`         | [YAML configuration](../recipe-configuration/) | value   | implemented  |
| `workflowOptions.options`     | [YAML configuration](../recipe-configuration/) | value   | implemented  |

Coverage describes local composition, not validation of every remote service. Tests use simulated agents, local HTTP models, real Git, Docker and Redis; paid calls, clouds and remote secret managers remain without live validation.
