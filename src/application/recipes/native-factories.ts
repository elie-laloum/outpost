import type { NativeRecipeFactory } from "./native-factories.types.ts";
export const nativeRecipeFactories: Readonly<
  Record<string, NativeRecipeFactory>
> = {
  "sandboxProvider.mounted": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/factories.ts"))
        .createMountedSandboxProvider,
  },
  "sandboxProvider.remote": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/factories.ts"))
        .createRemoteSandboxProvider,
  },
  "resolver.agent": {
    kind: "resolver",
    load: async () =>
      (await import("../../application/recipes/advanced-components.ts"))
        .createRecipeConflictResolver,
  },
  "sink.reporter": {
    kind: "sink",
    load: async () =>
      (await import("../../infrastructure/reporter.ts")).createReporter,
  },
  "sink.custom": {
    kind: "sink",
    load: async () =>
      (await import("../../application/recipes/advanced-components.ts"))
        .createRecipeCustomReporter,
    dispose: "close",
  },
  "sink.opentelemetry": {
    kind: "sink",
    load: async () =>
      (await import("../../infrastructure/opentelemetry.ts"))
        .createOpenTelemetryObserver,
    dispose: "close",
  },
  "queue.sqlite": {
    kind: "queue",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeSqliteQueue,
    dispose: "close",
  },
  "queue.http": {
    kind: "queue",
    load: async () =>
      (await import("../../infrastructure/task-queue-http.ts"))
        .createHttpTaskQueue,
  },
  "queue.bullmq": {
    kind: "queue",
    load: async () =>
      (await import("../../infrastructure/task-queue-bullmq.ts"))
        .createBullMQTaskQueue,
    dispose: "close",
  },
  "service.worker": {
    kind: "service",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeWorker,
  },
  "service.queue": {
    kind: "service",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeQueueServer,
  },
  "service.triggers": {
    kind: "service",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeTriggerServer,
  },
  "service.schedules": {
    kind: "service",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeSchedules,
  },
  "job.workflow": {
    kind: "job",
    load: async () =>
      (await import("../../application/workflow-job.ts")).defineWorkflowJob,
  },
  "job.recipe": {
    kind: "job",
    load: async () =>
      (await import("../../application/recipes/job.ts")).defineRecipeJob,
  },
  "cron.schedule": {
    kind: "cron",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeCron,
  },
  "schedule.cron": {
    kind: "schedule",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeSchedule,
  },
  "triggerMapper.job": {
    kind: "triggerMapper",
    load: async () =>
      (await import("../../application/recipes/service-components.ts"))
        .createRecipeTriggerMapper,
  },
  "triggerSource.github": {
    kind: "triggerSource",
    load: async () =>
      (await import("../../adapters/triggers/github-webhook.ts"))
        .createGithubWebhook,
  },
  "triggerSource.gitlab": {
    kind: "triggerSource",
    load: async () =>
      (await import("../../adapters/triggers/gitlab-webhook.ts"))
        .createGitlabWebhook,
  },
  "triggerSource.slack": {
    kind: "triggerSource",
    load: async () =>
      (await import("../../adapters/triggers/slack-request.ts"))
        .createSlackSource,
  },
  "triggerSource.standard": {
    kind: "triggerSource",
    load: async () =>
      (await import("../../adapters/triggers/standard-webhook.ts"))
        .createStandardWebhook,
  },
  "transport.s3": {
    kind: "transport",
    load: async () =>
      (await import("../../infrastructure/s3-transport.ts")).createS3Transport,
  },
  "checkpointStore.transport": {
    kind: "checkpointStore",
    load: async () =>
      (await import("../../infrastructure/recipes/checkpoint-store.ts"))
        .createRecipeCheckpointStore,
  },
  "taskCacheStore.transport": {
    kind: "taskCacheStore",
    load: async () =>
      (await import("../../infrastructure/transport-task-cache.ts"))
        .createTaskCacheStore,
  },
  "artifactStore.transport": {
    kind: "artifactStore",
    load: async () =>
      (await import("../../infrastructure/transport-artifact-store.ts"))
        .createArtifactStore,
  },
  "artifact.json": {
    kind: "artifact",
    load: async () =>
      (await import("../../application/recipes/storage-components.ts"))
        .defineRecipeJsonArtifact,
  },
  "artifact.binary": {
    kind: "artifact",
    load: async () =>
      (await import("../../domain/artifact.ts")).defineBinaryArtifact,
  },
  "verifier.ed25519": {
    kind: "verifier",
    load: async () =>
      (await import("../../infrastructure/workflow-decision-signature.ts"))
        .createEd25519DecisionVerifier,
  },
  "sink.run": {
    kind: "sink",
    load: async () =>
      (await import("../../infrastructure/run-observer.ts")).createRunObserver,
    dispose: "close",
  },
  "steering.controller": {
    kind: "steering",
    load: async () => (await import("../../domain/steering.ts")).createSteering,
  },
  "harness.outpost": {
    kind: "harness",
    load: async () => (await import("../../domain/harness.ts")).createHarness,
  },
  "modelProvider.openai": {
    kind: "modelProvider",
    load: async () =>
      (await import("../../adapters/models/openai-model-provider.ts"))
        .createOpenAIModelProvider,
  },
  "modelProvider.anthropic": {
    kind: "modelProvider",
    load: async () =>
      (await import("../../adapters/models/anthropic-model-provider.ts"))
        .createAnthropicModelProvider,
  },
  "decisionProvider.system-one": {
    kind: "decisionProvider",
    load: async () =>
      (await import("../../adapters/decisions/system-one-provider.ts"))
        .createSystemOneDecisionProvider,
  },
  "tool.custom": {
    kind: "tool",
    load: async () => (await import("../../domain/tool.ts")).defineHarnessTool,
  },
  "tool.subagent": {
    kind: "tool",
    load: async () =>
      (await import("../../domain/subagent.ts")).defineHarnessSubagent,
  },
  "toolset.custom": {
    kind: "toolset",
    load: async () =>
      (await import("../../domain/tool.ts")).defineHarnessToolset,
  },
  "toolset.files": {
    kind: "toolset",
    load: async () =>
      (await import("../../adapters/tools/file-tools.ts"))
        .createHarnessFileTools,
  },
  "toolset.edit": {
    kind: "toolset",
    load: async () =>
      (await import("../../adapters/tools/edit-tools.ts"))
        .createHarnessEditTools,
  },
  "toolset.git": {
    kind: "toolset",
    load: async () =>
      (await import("../../adapters/tools/git-tools.ts")).createHarnessGitTools,
  },
  "toolset.search": {
    kind: "toolset",
    load: async () =>
      (await import("../../adapters/tools/search-tools.ts"))
        .createHarnessSearchTools,
  },
  "toolset.shell": {
    kind: "toolset",
    load: async () =>
      (await import("../../adapters/tools/shell-tools.ts"))
        .createHarnessShellTools,
  },
  "permissions.rules": {
    kind: "permissions",
    load: async () =>
      (await import("../../domain/permissions.ts")).defineHarnessPermissions,
  },
  "hook.custom": {
    kind: "hook",
    load: async () => (await import("../../domain/hook.ts")).defineHarnessHook,
  },
  "skill.custom": {
    kind: "skill",
    load: async () =>
      (await import("../../domain/skill.ts")).defineHarnessSkill,
  },
  "context.custom": {
    kind: "context",
    load: async () =>
      (await import("../../domain/context.ts")).defineHarnessContextStrategy,
  },
  "context.truncate": {
    kind: "context",
    load: async () =>
      (await import("../../domain/context.ts")).truncateToolResults,
  },
  "context.summarize": {
    kind: "context",
    load: async () =>
      (await import("../../domain/context.ts")).summarizeHistory,
  },
  "instructions.source": {
    kind: "instructions",
    load: async () =>
      (await import("../../application/recipes/agent-components.ts"))
        .defineRecipeInstructions,
  },
  "instructions.mcp": {
    kind: "instructions",
    load: async () =>
      (await import("../../domain/mcp-prompt.ts")).defineMcpPrompt,
  },
  "agent.fallback": {
    kind: "agent",
    load: async () =>
      (await import("../../application/recipes/agent-components.ts"))
        .defineRecipeFallback,
  },
  "agent.replay": {
    kind: "agent",
    load: async () =>
      (await import("../../domain/replay.ts")).createReplayAgent,
  },
  "response.json": {
    kind: "response",
    load: async () =>
      (await import("../../application/recipes/agent-components.ts"))
        .defineRecipeJsonResponse,
  },
  "response.text": {
    kind: "response",
    load: async () =>
      (await import("../../domain/response.ts")).defineTextResponse,
  },
  "decision.questions": {
    kind: "decision",
    load: async () => (await import("../../domain/decision.ts")).defineDecision,
  },
  "routing.decision": {
    kind: "routing",
    load: async () =>
      (await import("../../domain/harness-routing.ts"))
        .defineHarnessModelRouting,
  },
  "conversations.transport": {
    kind: "conversations",
    load: async () =>
      (await import("../../application/recipes/agent-components.ts"))
        .createRecipeConversations,
  },
  "conversations.harness": {
    kind: "conversations",
    load: async () =>
      (await import("../../infrastructure/conversations/harness-store.ts"))
        .createHarnessConversations,
  },
  "conversations.claude": {
    kind: "conversations",
    load: async () =>
      (await import("../../adapters/agents/claude/claude-conversations.ts"))
        .createClaudeConversations,
  },
  "conversations.codex": {
    kind: "conversations",
    load: async () =>
      (await import("../../adapters/agents/codex/codex-conversations.ts"))
        .createCodexConversations,
  },
  "conversations.copilot": {
    kind: "conversations",
    load: async () =>
      (await import("../../adapters/agents/copilot/copilot-conversations.ts"))
        .createCopilotConversations,
  },
  "conversations.kimi": {
    kind: "conversations",
    load: async () =>
      (await import("../../adapters/agents/kimi/kimi-conversations.ts"))
        .createKimiConversations,
  },
  "conversations.transcript": {
    kind: "conversations",
    load: async () =>
      (await import("../../infrastructure/conversations/transcript-store.ts"))
        .createTranscriptConversations,
  },
  "conversations.bundle": {
    kind: "conversations",
    load: async () =>
      (await import("../../infrastructure/conversations/session-bundle.ts"))
        .createSessionBundleConversations,
  },
  "sandboxProvider.docker": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/docker.ts")).createDockerSandboxProvider,
  },
  "sandboxProvider.podman": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/podman.ts")).createPodmanSandboxProvider,
  },
  "sandboxProvider.local": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/local.ts")).createLocalSandboxProvider,
  },
  "sandboxProvider.vercel": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/vercel.ts")).createVercelSandboxProvider,
  },
  "sandboxProvider.daytona": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/daytona.ts")).createDaytonaSandboxProvider,
  },
  "sandboxProvider.firecracker": {
    kind: "sandboxProvider",
    load: async () =>
      (await import("../../providers/firecracker.ts"))
        .createFirecrackerSandboxProvider,
    experimental: true,
  },
  "profile.portable": {
    kind: "profile",
    load: async () =>
      (await import("../../domain/agent-profile.ts")).defineAgentProfile,
  },
  "secretSource.vault": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/vault.ts")).createVaultSecretSource,
  },
  "secretSource.aws": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/aws.ts")).createAwsSecretSource,
  },
  "secretSource.azure": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/azure.ts")).createAzureSecretSource,
  },
  "secretSource.gcp": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/gcp.ts")).createGcpSecretSource,
  },
  "secretSource.onepassword": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/onepassword.ts"))
        .createOnePasswordSecretSource,
  },
  "secretSource.infisical": {
    kind: "secretSource",
    load: async () =>
      (await import("../../adapters/secrets/infisical.ts"))
        .createInfisicalSecretSource,
  },
  "harness.codex": {
    kind: "harness",
    load: async () =>
      (await import("../../adapters/agents/codex/codex-adapter.ts"))
        .createCodexHarness,
  },
  "harness.claude": {
    kind: "harness",
    load: async () =>
      (await import("../../adapters/agents/claude/claude-adapter.ts"))
        .createClaudeHarness,
  },
  "harness.agy": {
    kind: "harness",
    load: async () =>
      (await import("../../adapters/agents/antigravity/antigravity-adapter.ts"))
        .createAntigravityHarness,
  },
  "harness.copilot": {
    kind: "harness",
    load: async () =>
      (await import("../../adapters/agents/copilot/copilot-adapter.ts"))
        .createCopilotHarness,
  },
  "harness.kimi": {
    kind: "harness",
    load: async () =>
      (await import("../../adapters/agents/kimi/kimi-adapter.ts"))
        .createKimiHarness,
  },
  "agent.composed": {
    kind: "agent",
    load: async () => (await import("../../domain/agent.ts")).createAgent,
  },
  "transport.local": {
    kind: "transport",
    load: async () =>
      (await import("../../infrastructure/local-transport.ts"))
        .createLocalTransport,
  },
};
