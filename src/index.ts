export { agent, harness } from "./domain/agent.ts";
export type {
  AgentAuthentication,
  Agent,
  AgentOptions,
  Harness,
  CliHarness,
  CustomHarness,
  CliAgent,
  CustomAgent,
  CustomHarnessOptions,
  HarnessInput,
  HarnessContext,
  HarnessRun,
} from "./domain/agent.types.ts";
export { TransportConflict } from "./domain/transport.ts";
export type {
  Transport,
  TransportEntry,
  TransportObject,
  TransportReadOptions,
  TransportWriteOptions,
  TransportReference,
  TransportStoreOptions,
} from "./domain/transport.types.ts";
export { localTransport } from "./infrastructure/local-transport.ts";
export type { LocalTransportOptions } from "./infrastructure/local-transport.types.ts";
export { artifactStore } from "./infrastructure/transport-artifact-store.ts";
export type { ArtifactStoreOptions } from "./infrastructure/transport-artifact-store.types.ts";
export {
  workflowCheckpointStore,
  recoverWorkflowCheckpoint,
} from "./infrastructure/transport-checkpoint.ts";
export type { CheckpointRecoveryOptions } from "./infrastructure/transport-checkpoint.types.ts";
export { readJournal } from "./infrastructure/transport-journal.ts";
export type { ReadJournalOptions } from "./infrastructure/transport-journal.types.ts";
export { transportConversations } from "./infrastructure/transport-conversations.ts";
export type { TransportConversationOptions } from "./infrastructure/transport-conversations.types.ts";
export {
  archiveRecovery,
  materializeRecoveryArchive,
} from "./application/recovery-archive.ts";
export type {
  RecoveryArchiveOptions,
  RecoveryArchiveRestoreOptions,
} from "./application/recovery-archive.types.ts";

export {
  attach,
  createSandbox,
  dispatch,
  openWorkspace,
} from "./application/outpost.ts";

export type {
  AttachOptions,
  AttachResult,
  ContinuationOptions,
  DispatchResult,
  Sandbox,
  SandboxOptions,
  WarmDispatchResult,
  Workspace,
  WorkspaceOptions,
} from "./application/outpost.ts";

export type {
  DispatchOptions,
  Execution,
  Turn,
} from "./application/execution.ts";

export {
  WorkflowFailure,
  WorkflowBudgetExceeded,
  task,
  workflow,
} from "./domain/workflow.ts";

export type {
  Retry,
  Task,
  TaskContext,
  TaskOptions,
  TaskRecord,
  TaskStatus,
  Workflow,
  WorkflowEvent,
  WorkflowOptions,
  WorkflowBudget,
  WorkflowUsage,
  WorkflowResult,
  WorkflowTelemetry,
} from "./domain/workflow.ts";

export { agentTask, commandTask, isolatedTask } from "./application/tasks.ts";

export {
  claudeHarness,
  codexHarness,
  geminiHarness,
} from "./providers/agents.ts";

export { agentVersions } from "./providers/versions.ts";

export { conversations } from "./infrastructure/conversations.ts";

export type {
  ConversationFormat,
  ConversationLocation,
} from "./infrastructure/conversations.ts";

export type {
  ClaudeSettings,
  CodexSettings,
  CodexModelProvider,
  GeminiSettings,
} from "./providers/agents.ts";

export {
  mountedSandboxProvider,
  remoteSandboxProvider,
} from "./providers/factories.ts";

export { ResponseError, response } from "./domain/response.ts";

export type { ResponseSpec, StandardValidator } from "./domain/response.ts";

export { OutpostError, recoveryDetails } from "./domain/errors.ts";

export type { FaultCode } from "./domain/errors.ts";

export type {
  AgentAdapter,
  AgentEvent,
  AgentInput,
  AgentObservation,
  BranchPolicy,
  Channel,
  Command,
  CommandResult,
  Commit,
  ConversationContext,
  ConversationRecord,
  ConversationStore,
  Disposal,
  LifecycleHooks,
  FileManifestEntry,
  FileTransfers,
  SandboxContext,
  SandboxLease,
  SandboxProvider,
  StageLimits,
  TransferOptions,
  Usage,
  Variables,
  Volume,
  WorkspaceRecord,
} from "./domain/ports.ts";

export type { Brief, PromptVariables } from "./domain/prompts.ts";

export type { Logging } from "./infrastructure/journal.ts";

export { createReporter } from "./infrastructure/custom-reporter.ts";
export type {
  CustomReporter,
  CustomReporterOptions,
  ReporterHandlers,
} from "./infrastructure/custom-reporter.types.ts";
export type {
  DispatchTelemetry,
  DispatchTelemetrySession,
  DispatchTelemetryOutcome,
} from "./domain/dispatch-telemetry.types.ts";
export { reporter } from "./infrastructure/reporter.ts";

export type { ReporterOptions } from "./infrastructure/reporter.ts";

export type { VariableQuestion } from "./application/interactive-brief.ts";

export {
  planRecoveryRetention,
  pruneRecoveryRetention,
  assertRecoveryQuota,
} from "./application/recovery-retention.ts";
export type {
  RecoveryRetentionPolicy,
  RecoveryRetentionOptions,
  RecoveryRetentionPlan,
  RecoveryRetentionEntry,
  RecoveryPruneResult,
  RecoveryQuotaOptions,
} from "./application/recovery-retention.types.ts";
export { verifyRecoveryTransfer } from "./application/recovery-verification.ts";
export type {
  RecoveryVerification,
  RecoveryVerificationOptions,
} from "./application/recovery-verification.types.ts";

export { diagnoseSandbox } from "./application/doctor-sandbox.ts";
export type {
  SandboxDiagnosticOptions,
  SandboxDiagnosticReport,
  DiagnosticCapability,
} from "./application/doctor-sandbox.types.ts";
export type {
  DiagnosticCheck,
  DiagnosticStatus,
  DoctorAgent,
} from "./application/doctor.types.ts";
export { diagnoseAgentProtocol } from "./application/doctor-protocol.ts";
export type { AgentProtocolReport } from "./application/doctor-protocol.types.ts";

export { reserveRecoveryStorage } from "./application/storage-reservation.ts";
export type { RecoveryStorageReservationOptions } from "./application/storage-reservation.types.ts";
export type {
  StorageReservation,
  StorageReservationOptions,
} from "./infrastructure/storage-reservations.types.ts";

export {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "./application/recovery-restore.ts";
export type {
  RecoveryRestoreOptions,
  RecoveryRestorePlan,
  RecoveryRestoreResult,
} from "./application/recovery-restore.types.ts";

export { fileWorkflowCheckpointStore } from "./infrastructure/workflow-checkpoint.ts";
export type { FileWorkflowCheckpointOptions } from "./infrastructure/workflow-checkpoint.types.ts";
export type {
  WorkflowCheckpoint,
  WorkflowCheckpointOptions,
  WorkflowCheckpointStore,
  WorkflowCheckpointLease,
  WorkflowCheckpointValue,
  WorkflowJson,
} from "./domain/workflow/checkpoint.types.ts";

export { approvalTask, pauseTask } from "./domain/workflow/gates.ts";
export type {
  WorkflowGate,
  WorkflowGateOptions,
  WorkflowPauseRequest,
  WorkflowDecision,
  WorkflowDecisionRecord,
} from "./domain/workflow/gates.types.ts";

export { inspectRecovery } from "./application/recovery-inspection.ts";
export type {
  RecoveryInspection,
  RecoveryInspectionOptions,
} from "./application/recovery-inspection.types.ts";
export type {
  ResourceActivityRecord,
  ResourceInspection,
  ResourceInspectionEntry,
  ResourceOperation,
  ResourceOperationKind,
  ResourceOperationResult,
  ResourcePhase,
} from "./infrastructure/resource-activity.types.ts";

export {
  artifact,
  publishArtifact,
  readStoredArtifact,
} from "./domain/artifact.ts";
export { artifactTask, readArtifact } from "./application/artifact-tasks.ts";
export { fileArtifactStore } from "./infrastructure/artifact-store.ts";
export type {
  ArtifactContract,
  ArtifactContractOptions,
  ArtifactIdentity,
  ArtifactProducer,
  ArtifactReference,
  ArtifactStore,
  JsonArtifactOptions,
  PublishArtifactOptions,
  ReadArtifactOptions,
} from "./domain/artifact.types.ts";
export type { ArtifactTaskOptions } from "./application/artifact-tasks.types.ts";
export type { FileArtifactStoreOptions } from "./infrastructure/artifact-store.types.ts";

export { sqliteTaskQueue } from "./infrastructure/task-queue.ts";
export {
  serveTaskQueue,
  httpTaskQueue,
} from "./infrastructure/task-queue-http.ts";
export { runQueueWorker } from "./application/queue-worker.ts";
export { queuedTask } from "./application/queued-task.ts";
export type {
  QueueRequest,
  QueueResult,
  QueueJob,
  QueueClaim,
  QueueLease,
  TaskQueue,
  DurableTaskQueue,
} from "./domain/task-queue.types.ts";
export type {
  QueueServerOptions,
  QueueServer,
  QueueClientOptions,
} from "./infrastructure/task-queue-http.types.ts";
export type {
  QueueHandlerContext,
  QueueHandler,
  QueueWorkerOptions,
} from "./application/queue-worker.types.ts";
export type { QueuedTaskOptions } from "./application/queued-task.types.ts";

export type { EgressPolicy } from "./domain/egress.types.ts";

export { speculate } from "./application/speculation.ts";
export type {
  SpeculationOptions,
  SpeculationResult,
  SpeculativeCandidate,
  SpeculativeCandidateResult,
  SpeculativeOutput,
  SpeculativeHostSnapshot,
  SpeculativeValidation,
} from "./application/speculation.types.ts";

export { openaiModelProvider } from "./adapters/models/openai-model-provider.ts";
export type { OpenAIModelProviderOptions } from "./adapters/models/openai-model-provider.types.ts";
export type {
  AgentModel,
  ModelProvider,
  ModelReasoning,
  ModelRequest,
  ModelResult,
  ModelSpec,
} from "./domain/model.types.ts";
export { anthropicModelProvider } from "./adapters/models/anthropic-model-provider.ts";
export type { AnthropicModelProviderOptions } from "./adapters/models/anthropic-model-provider.types.ts";
