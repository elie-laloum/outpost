export const nativeRecipeFactories: Readonly<
  Record<string, () => Promise<unknown>>
> = {
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
