export const nativeRecipeFactories: Readonly<
  Record<string, () => Promise<unknown>>
> = {
  "transport.s3": async () =>
    (await import("../../infrastructure/s3-transport.ts")).createS3Transport,
  "checkpointStore.transport": async () =>
    (await import("../../infrastructure/recipes/checkpoint-store.ts"))
      .createRecipeCheckpointStore,
  "taskCacheStore.transport": async () =>
    (await import("../../infrastructure/transport-task-cache.ts"))
      .createTaskCacheStore,
  "artifactStore.transport": async () =>
    (await import("../../infrastructure/transport-artifact-store.ts"))
      .createArtifactStore,
  "artifact.json": async () =>
    (await import("../../application/recipes/storage-components.ts"))
      .defineRecipeJsonArtifact,
  "artifact.binary": async () =>
    (await import("../../domain/artifact.ts")).defineBinaryArtifact,
  "verifier.ed25519": async () =>
    (await import("../../infrastructure/workflow-decision-signature.ts"))
      .createEd25519DecisionVerifier,
  "sink.run": async () =>
    (await import("../../infrastructure/run-observer.ts")).createRunObserver,
  "steering.controller": async () =>
    (await import("../../domain/steering.ts")).createSteering,
  "harness.outpost": async () =>
    (await import("../../domain/harness.ts")).createHarness,
  "modelProvider.openai": async () =>
    (await import("../../adapters/models/openai-model-provider.ts"))
      .createOpenAIModelProvider,
  "modelProvider.anthropic": async () =>
    (await import("../../adapters/models/anthropic-model-provider.ts"))
      .createAnthropicModelProvider,
  "decisionProvider.system-one": async () =>
    (await import("../../adapters/decisions/system-one-provider.ts"))
      .createSystemOneDecisionProvider,
  "tool.custom": async () =>
    (await import("../../domain/tool.ts")).defineHarnessTool,
  "tool.subagent": async () =>
    (await import("../../domain/subagent.ts")).defineHarnessSubagent,
  "toolset.custom": async () =>
    (await import("../../domain/tool.ts")).defineHarnessToolset,
  "toolset.files": async () =>
    (await import("../../adapters/tools/file-tools.ts")).createHarnessFileTools,
  "toolset.edit": async () =>
    (await import("../../adapters/tools/edit-tools.ts")).createHarnessEditTools,
  "toolset.git": async () =>
    (await import("../../adapters/tools/git-tools.ts")).createHarnessGitTools,
  "toolset.search": async () =>
    (await import("../../adapters/tools/search-tools.ts"))
      .createHarnessSearchTools,
  "toolset.shell": async () =>
    (await import("../../adapters/tools/shell-tools.ts"))
      .createHarnessShellTools,
  "permissions.rules": async () =>
    (await import("../../domain/permissions.ts")).defineHarnessPermissions,
  "hook.custom": async () =>
    (await import("../../domain/hook.ts")).defineHarnessHook,
  "skill.custom": async () =>
    (await import("../../domain/skill.ts")).defineHarnessSkill,
  "context.custom": async () =>
    (await import("../../domain/context.ts")).defineHarnessContextStrategy,
  "context.truncate": async () =>
    (await import("../../domain/context.ts")).truncateToolResults,
  "context.summarize": async () =>
    (await import("../../domain/context.ts")).summarizeHistory,
  "instructions.source": async () =>
    (await import("../../application/recipes/agent-components.ts"))
      .defineRecipeInstructions,
  "instructions.mcp": async () =>
    (await import("../../domain/mcp-prompt.ts")).defineMcpPrompt,
  "agent.fallback": async () =>
    (await import("../../application/recipes/agent-components.ts"))
      .defineRecipeFallback,
  "agent.replay": async () =>
    (await import("../../domain/replay.ts")).createReplayAgent,
  "response.json": async () =>
    (await import("../../application/recipes/agent-components.ts"))
      .defineRecipeJsonResponse,
  "response.text": async () =>
    (await import("../../domain/response.ts")).defineTextResponse,
  "decision.questions": async () =>
    (await import("../../domain/decision.ts")).defineDecision,
  "routing.decision": async () =>
    (await import("../../domain/harness-routing.ts")).defineHarnessModelRouting,
  "conversations.transport": async () =>
    (await import("../../application/recipes/agent-components.ts"))
      .createRecipeConversations,
  "conversations.harness": async () =>
    (await import("../../infrastructure/conversations/harness-store.ts"))
      .createHarnessConversations,
  "conversations.claude": async () =>
    (await import("../../adapters/agents/claude/claude-conversations.ts"))
      .createClaudeConversations,
  "conversations.codex": async () =>
    (await import("../../adapters/agents/codex/codex-conversations.ts"))
      .createCodexConversations,
  "conversations.copilot": async () =>
    (await import("../../adapters/agents/copilot/copilot-conversations.ts"))
      .createCopilotConversations,
  "conversations.kimi": async () =>
    (await import("../../adapters/agents/kimi/kimi-conversations.ts"))
      .createKimiConversations,
  "conversations.transcript": async () =>
    (await import("../../infrastructure/conversations/transcript-store.ts"))
      .createTranscriptConversations,
  "conversations.bundle": async () =>
    (await import("../../infrastructure/conversations/session-bundle.ts"))
      .createSessionBundleConversations,
  "sandboxProvider.docker": async () =>
    (await import("../../providers/docker.ts")).createDockerSandboxProvider,
  "sandboxProvider.podman": async () =>
    (await import("../../providers/podman.ts")).createPodmanSandboxProvider,
  "sandboxProvider.local": async () =>
    (await import("../../providers/local.ts")).createLocalSandboxProvider,
  "sandboxProvider.vercel": async () =>
    (await import("../../providers/vercel.ts")).createVercelSandboxProvider,
  "sandboxProvider.daytona": async () =>
    (await import("../../providers/daytona.ts")).createDaytonaSandboxProvider,
  "sandboxProvider.firecracker": async () =>
    (await import("../../providers/firecracker.ts"))
      .createFirecrackerSandboxProvider,
  "profile.portable": async () =>
    (await import("../../domain/agent-profile.ts")).defineAgentProfile,
  "secretSource.vault": async () =>
    (await import("../../adapters/secrets/vault.ts")).createVaultSecretSource,
  "secretSource.aws": async () =>
    (await import("../../adapters/secrets/aws.ts")).createAwsSecretSource,
  "secretSource.azure": async () =>
    (await import("../../adapters/secrets/azure.ts")).createAzureSecretSource,
  "secretSource.gcp": async () =>
    (await import("../../adapters/secrets/gcp.ts")).createGcpSecretSource,
  "secretSource.onepassword": async () =>
    (await import("../../adapters/secrets/onepassword.ts"))
      .createOnePasswordSecretSource,
  "secretSource.infisical": async () =>
    (await import("../../adapters/secrets/infisical.ts"))
      .createInfisicalSecretSource,
  "harness.codex": async () =>
    (await import("../../adapters/agents/codex/codex-adapter.ts"))
      .createCodexHarness,
  "harness.claude": async () =>
    (await import("../../adapters/agents/claude/claude-adapter.ts"))
      .createClaudeHarness,
  "harness.agy": async () =>
    (await import("../../adapters/agents/antigravity/antigravity-adapter.ts"))
      .createAntigravityHarness,
  "harness.copilot": async () =>
    (await import("../../adapters/agents/copilot/copilot-adapter.ts"))
      .createCopilotHarness,
  "harness.kimi": async () =>
    (await import("../../adapters/agents/kimi/kimi-adapter.ts"))
      .createKimiHarness,
  "agent.composed": async () =>
    (await import("../../domain/agent.ts")).createAgent,
  "transport.local": async () =>
    (await import("../../infrastructure/local-transport.ts"))
      .createLocalTransport,
};
