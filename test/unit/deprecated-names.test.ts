import assert from "node:assert/strict";
import { test } from "node:test";
import * as api from "../../src/index.ts";
import * as daytona from "../../src/providers/daytona.ts";
import * as docker from "../../src/providers/docker.ts";
import * as firecracker from "../../src/providers/firecracker.ts";
import * as local from "../../src/providers/local.ts";
import * as podman from "../../src/providers/podman.ts";
import * as vercel from "../../src/providers/vercel.ts";
import * as openTelemetry from "../../src/infrastructure/opentelemetry.ts";
import * as s3 from "../../src/infrastructure/s3-transport.ts";
import * as bullmq from "../../src/infrastructure/task-queue-bullmq.ts";

const renamed = {
  agent: "createAgent",
  fallbackAgent: "createFallbackAgent",
  replayAgent: "createReplayAgent",
  harness: "createHarness",
  antigravityHarness: "createAntigravityHarness",
  claudeHarness: "createClaudeHarness",
  codexHarness: "createCodexHarness",
  copilotHarness: "createCopilotHarness",
  kimiHarness: "createKimiHarness",
  harnessEditTools: "createHarnessEditTools",
  harnessFileTools: "createHarnessFileTools",
  harnessGitTools: "createHarnessGitTools",
  harnessSearchTools: "createHarnessSearchTools",
  harnessShellTools: "createHarnessShellTools",
  openaiModelProvider: "createOpenAIModelProvider",
  anthropicModelProvider: "createAnthropicModelProvider",
  localTransport: "createLocalTransport",
  artifactStore: "createArtifactStore",
  workflowCheckpointStore: "createWorkflowCheckpointStore",
  taskCacheStore: "createTaskCacheStore",
  transportConversations: "createTransportConversations",
  harnessConversations: "createHarnessConversations",
  mountedSandboxProvider: "createMountedSandboxProvider",
  remoteSandboxProvider: "createRemoteSandboxProvider",
  sqliteTaskQueue: "createSqliteTaskQueue",
  httpTaskQueue: "createHttpTaskQueue",
  ed25519DecisionVerifier: "createEd25519DecisionVerifier",
  reporter: "createReporter",
  workflow: "defineWorkflow",
  task: "defineTask",
  agentTask: "defineAgentTask",
  isolatedTask: "defineIsolatedTask",
  commandTask: "defineCommandTask",
  approvalTask: "defineApprovalTask",
  pauseTask: "definePauseTask",
  artifactTask: "defineArtifactTask",
  queuedTask: "defineQueuedTask",
  interactiveAgentTask: "defineInteractiveAgentTask",
  loopTask: "defineLoopTask",
} as const;

test("deprecated facade names are the create* and define* functions", () => {
  for (const [previous, current] of Object.entries(renamed)) {
    assert.equal(typeof api[current], "function", current);
    assert.equal(api[previous as keyof typeof api], api[current], previous);
  }
  assert.equal(api.response.text, api.defineTextResponse);
  assert.equal(api.response.json, api.defineJsonResponse);
  assert.equal(api.artifact.json, api.defineJsonArtifact);
  assert.equal(api.artifact.binary, api.defineBinaryArtifact);
});

test("createReporter builds the console reporter and custom handlers moved", () => {
  let written = "";
  api.createReporter({ write: (text) => void (written += text) })({
    kind: "result",
    text: "done",
  } as Parameters<ReturnType<typeof api.createReporter>>[0]);
  assert.match(written, /result: done/);
  assert.equal(typeof api.createCustomReporter({}).flush, "function");
});

test("deprecated subpath names are the create* functions", () => {
  assert.equal(
    docker.dockerSandboxProvider,
    docker.createDockerSandboxProvider,
  );
  assert.equal(
    podman.podmanSandboxProvider,
    podman.createPodmanSandboxProvider,
  );
  assert.equal(local.localSandboxProvider, local.createLocalSandboxProvider);
  assert.equal(
    vercel.vercelSandboxProvider,
    vercel.createVercelSandboxProvider,
  );
  assert.equal(
    daytona.daytonaSandboxProvider,
    daytona.createDaytonaSandboxProvider,
  );
  assert.equal(
    firecracker.firecrackerSandboxProvider,
    firecracker.createFirecrackerSandboxProvider,
  );
  assert.equal(
    openTelemetry.openTelemetry,
    openTelemetry.createOpenTelemetryObserver,
  );
  assert.equal(s3.s3Transport, s3.createS3Transport);
  assert.equal(bullmq.bullmqTaskQueue, bullmq.createBullMQTaskQueue);
});
