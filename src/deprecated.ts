import { createHarnessEditTools } from "./adapters/tools/edit-tools.ts";
import { createHarnessFileTools } from "./adapters/tools/file-tools.ts";
import { createHarnessGitTools } from "./adapters/tools/git-tools.ts";
import { createHarnessSearchTools } from "./adapters/tools/search-tools.ts";
import { createHarnessShellTools } from "./adapters/tools/shell-tools.ts";
import { createAnthropicModelProvider } from "./adapters/models/anthropic-model-provider.ts";
import { createOpenAIModelProvider } from "./adapters/models/openai-model-provider.ts";
import { defineArtifactTask } from "./application/artifact-tasks.ts";
import { defineInteractiveAgentTask } from "./application/interactive-task.ts";
import { defineQueuedTask } from "./application/queued-task.ts";
import {
  defineAgentTask,
  defineCommandTask,
  defineIsolatedTask,
} from "./application/tasks.ts";
import { createAgent } from "./domain/agent.ts";
import { defineBinaryArtifact, defineJsonArtifact } from "./domain/artifact.ts";
import { createFallbackAgent } from "./domain/fallback-agent.ts";
import { createHarness } from "./domain/harness.ts";
import { createReplayAgent } from "./domain/replay.ts";
import { defineJsonResponse, defineTextResponse } from "./domain/response.ts";
import { defineWorkflow } from "./domain/workflow.ts";
import {
  defineApprovalTask,
  definePauseTask,
} from "./domain/workflow/gates.ts";
import { defineLoopTask } from "./domain/workflow/loop-task.ts";
import { defineTask } from "./domain/workflow/task.ts";
import { createHarnessConversations } from "./infrastructure/conversations/harness-store.ts";
import { createLocalTransport } from "./infrastructure/local-transport.ts";
import { createReporter } from "./infrastructure/reporter.ts";
import { createArtifactStore } from "./infrastructure/transport-artifact-store.ts";
import { createWorkflowCheckpointStore } from "./infrastructure/transport-checkpoint.ts";
import { createTransportConversations } from "./infrastructure/transport-conversations.ts";
import { createTaskCacheStore } from "./infrastructure/transport-task-cache.ts";
import { createSqliteTaskQueue } from "./infrastructure/task-queue.ts";
import { createHttpTaskQueue } from "./infrastructure/task-queue-http.ts";
import { createEd25519DecisionVerifier } from "./infrastructure/workflow-decision-signature.ts";
import {
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
} from "./providers/agents.ts";
import {
  createMountedSandboxProvider,
  createRemoteSandboxProvider,
} from "./providers/factories.ts";

/** @deprecated Use {@link createAgent}. */
export const agent = createAgent;
/** @deprecated Use {@link createFallbackAgent}. */
export const fallbackAgent = createFallbackAgent;
/** @deprecated Use {@link createReplayAgent}. */
export const replayAgent = createReplayAgent;
/** @deprecated Use {@link createHarness}. */
export const harness = createHarness;
/** @deprecated Use {@link createAntigravityHarness}. */
export const antigravityHarness = createAntigravityHarness;
/** @deprecated Use {@link createClaudeHarness}. */
export const claudeHarness = createClaudeHarness;
/** @deprecated Use {@link createCodexHarness}. */
export const codexHarness = createCodexHarness;
/** @deprecated Use {@link createCopilotHarness}. */
export const copilotHarness = createCopilotHarness;
/** @deprecated Use {@link createKimiHarness}. */
export const kimiHarness = createKimiHarness;
/** @deprecated Use {@link createHarnessEditTools}. */
export const harnessEditTools = createHarnessEditTools;
/** @deprecated Use {@link createHarnessFileTools}. */
export const harnessFileTools = createHarnessFileTools;
/** @deprecated Use {@link createHarnessGitTools}. */
export const harnessGitTools = createHarnessGitTools;
/** @deprecated Use {@link createHarnessSearchTools}. */
export const harnessSearchTools = createHarnessSearchTools;
/** @deprecated Use {@link createHarnessShellTools}. */
export const harnessShellTools = createHarnessShellTools;
/** @deprecated Use {@link createOpenAIModelProvider}. */
export const openaiModelProvider = createOpenAIModelProvider;
/** @deprecated Use {@link createAnthropicModelProvider}. */
export const anthropicModelProvider = createAnthropicModelProvider;
/** @deprecated Use {@link createLocalTransport}. */
export const localTransport = createLocalTransport;
/** @deprecated Use {@link createArtifactStore}. */
export const artifactStore = createArtifactStore;
/** @deprecated Use {@link createWorkflowCheckpointStore}. */
export const workflowCheckpointStore = createWorkflowCheckpointStore;
/** @deprecated Use {@link createTaskCacheStore}. */
export const taskCacheStore = createTaskCacheStore;
/** @deprecated Use {@link createTransportConversations}. */
export const transportConversations = createTransportConversations;
/** @deprecated Use {@link createHarnessConversations}. */
export const harnessConversations = createHarnessConversations;
/** @deprecated Use {@link createMountedSandboxProvider}. */
export const mountedSandboxProvider = createMountedSandboxProvider;
/** @deprecated Use {@link createRemoteSandboxProvider}. */
export const remoteSandboxProvider = createRemoteSandboxProvider;
/** @deprecated Use {@link createSqliteTaskQueue}. */
export const sqliteTaskQueue = createSqliteTaskQueue;
/** @deprecated Use {@link createHttpTaskQueue}. */
export const httpTaskQueue = createHttpTaskQueue;
/** @deprecated Use {@link createEd25519DecisionVerifier}. */
export const ed25519DecisionVerifier = createEd25519DecisionVerifier;
/** @deprecated Use {@link createReporter}. */
export const reporter = createReporter;
/** @deprecated Use {@link defineWorkflow}. */
export const workflow = defineWorkflow;
/** @deprecated Use {@link defineTask}. */
export const task = defineTask;
/** @deprecated Use {@link defineAgentTask}. */
export const agentTask = defineAgentTask;
/** @deprecated Use {@link defineIsolatedTask}. */
export const isolatedTask = defineIsolatedTask;
/** @deprecated Use {@link defineCommandTask}. */
export const commandTask = defineCommandTask;
/** @deprecated Use {@link defineApprovalTask}. */
export const approvalTask = defineApprovalTask;
/** @deprecated Use {@link definePauseTask}. */
export const pauseTask = definePauseTask;
/** @deprecated Use {@link defineArtifactTask}. */
export const artifactTask = defineArtifactTask;
/** @deprecated Use {@link defineQueuedTask}. */
export const queuedTask = defineQueuedTask;
/** @deprecated Use {@link defineInteractiveAgentTask}. */
export const interactiveAgentTask = defineInteractiveAgentTask;
/** @deprecated Use {@link defineLoopTask}. */
export const loopTask = defineLoopTask;
/** @deprecated Use {@link defineTextResponse} and {@link defineJsonResponse}. */
export const response = { text: defineTextResponse, json: defineJsonResponse };
/** @deprecated Use {@link defineJsonArtifact} and {@link defineBinaryArtifact}. */
export const artifact = {
  json: defineJsonArtifact,
  binary: defineBinaryArtifact,
};
