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

const retired = {
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

test("retired facade names are no longer exported", () => {
  for (const [previous, current] of Object.entries(retired)) {
    assert.equal(typeof api[current], "function", current);
    assert.equal(previous in api, false, previous);
  }
  assert.equal("response" in api, false);
  assert.equal("artifact" in api, false);
  assert.equal("StoredConversationFormat" in api, false);
  for (const name of ["native", "locate", "capture", "restore", "claudePath"])
    assert.equal(name in api.conversations, false, name);
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

test("retired subpath names are no longer exported", () => {
  const modules = [
    [docker, "dockerSandboxProvider", "createDockerSandboxProvider"],
    [podman, "podmanSandboxProvider", "createPodmanSandboxProvider"],
    [local, "localSandboxProvider", "createLocalSandboxProvider"],
    [vercel, "vercelSandboxProvider", "createVercelSandboxProvider"],
    [daytona, "daytonaSandboxProvider", "createDaytonaSandboxProvider"],
    [
      firecracker,
      "firecrackerSandboxProvider",
      "createFirecrackerSandboxProvider",
    ],
    [openTelemetry, "openTelemetry", "createOpenTelemetryObserver"],
    [s3, "s3Transport", "createS3Transport"],
    [bullmq, "bullmqTaskQueue", "createBullMQTaskQueue"],
  ] as const;
  for (const [exports, previous, current] of modules) {
    assert.equal(typeof exports[current as keyof typeof exports], "function");
    assert.equal(previous in exports, false, previous);
  }
});
