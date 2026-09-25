export const groups = [
  {
    title: ["Diagnostics", "Diagnostics"],
    guide: "guide/operations/doctor",
    names:
      "diagnoseSandbox SandboxDiagnosticOptions SandboxDiagnosticReport DiagnosticCapability DiagnosticCheck DiagnosticStatus DoctorAgent diagnoseAgentProtocol AgentProtocolReport",
  },
  {
    title: ["Workspaces", "Workspaces"],
    guide: "guide/environment/workspaces",
    names:
      "openWorkspace Workspace WorkspaceOptions WorkspaceRecord BranchPolicy Commit Disposal StageLimits LifecycleHooks",
  },
  {
    title: ["Sandboxes", "Sandboxes"],
    guide: "guide/environment/lifecycle",
    names: "createSandbox Sandbox SandboxOptions",
  },
  {
    title: ["Dispatch", "Dispatch"],
    guide: "guide/agents/dispatch",
    names:
      "dispatch DispatchOptions DispatchResult WarmDispatchResult ContinuationOptions Execution Turn",
  },
  {
    title: ["Commands and terminal", "Commandes et terminal"],
    guide: "guide/environment/commands",
    names:
      "attach AttachOptions AttachResult Command CommandResult Channel VariableQuestion",
  },
  {
    title: ["Agents", "Agents"],
    guide: "guide/agents/adapters",
    names:
      "claude codex gemini ClaudeSettings CodexSettings CodexModelProvider GeminiSettings agentVersions AgentAdapter AgentInput",
  },
  {
    title: ["Prompts and responses", "Prompts et réponses"],
    guide: "guide/agents/responses",
    names:
      "Brief PromptVariables response ResponseSpec StandardValidator ResponseError",
  },
  {
    title: ["Conversations", "Conversations"],
    guide: "guide/agents/conversations",
    names:
      "conversations ConversationFormat ConversationLocation ConversationContext ConversationRecord ConversationStore",
  },
  {
    title: ["Observability", "Observabilité"],
    guide: "guide/agents/observability",
    names:
      "reporter ReporterOptions Logging AgentEvent AgentObservation Usage openTelemetry OpenTelemetryOptions OpenTelemetryObserver",
  },
  {
    title: ["Workflows", "Workflows"],
    guide: "guide/workflows/graph",
    names:
      "task workflow WorkflowFailure Retry Task TaskContext TaskOptions TaskRecord TaskStatus Workflow WorkflowEvent WorkflowOptions WorkflowBudget WorkflowUsage WorkflowBudgetExceeded WorkflowResult agentTask commandTask isolatedTask",
  },
  {
    title: ["Providers", "Providers"],
    guide: "guide/environment/providers/overview",
    names:
      "docker podman local vercel daytona ContainerOptions DependencyCache VercelOptions DaytonaOptions mountedProvider remoteProvider SandboxContext SandboxLease SandboxProvider TransferOptions Variables Volume",
  },
  {
    title: ["Remote transfers", "Transferts distants"],
    guide: "guide/operations/remote-transfers",
    names: "FileManifestEntry FileTransfers",
  },
  {
    title: ["Recovery and retention", "Récupération et rétention"],
    guide: "guide/operations/recovery",
    names:
      "planRecoveryRetention pruneRecoveryRetention assertRecoveryQuota RecoveryRetentionPolicy RecoveryRetentionOptions RecoveryRetentionPlan RecoveryRetentionEntry RecoveryPruneResult RecoveryQuotaOptions verifyRecoveryTransfer RecoveryVerification RecoveryVerificationOptions",
  },
  {
    title: ["Errors", "Erreurs"],
    guide: "guide/operations/recovery",
    names: "OutpostError recoveryDetails FaultCode",
  },
  {
    title: ["Storage reservations", "Réservations de stockage"],
    guide: "guide/operations/storage-retention",
    names:
      "reserveRecoveryStorage RecoveryStorageReservationOptions StorageReservation StorageReservationOptions",
  },
  {
    title: ["Recovery restoration", "Restauration de récupération"],
    guide: "guide/operations/recovery-restoration",
    names:
      "planRecoveryRestore restoreRecoveryTransfer RecoveryRestoreOptions RecoveryRestorePlan RecoveryRestoreResult",
  },
  {
    title: ["Resource activity", "Activité des ressources"],
    guide: "guide/operations/recovery",
    names:
      "inspectRecovery RecoveryInspection RecoveryInspectionOptions ResourceActivityRecord ResourceInspection ResourceInspectionEntry ResourceOperation ResourceOperationKind ResourceOperationResult ResourcePhase",
  },
  {
    title: ["Workflow checkpoints", "Checkpoints de workflow"],
    guide: "guide/advanced/checkpoints",
    names:
      "fileWorkflowCheckpointStore FileWorkflowCheckpointOptions WorkflowCheckpoint WorkflowCheckpointOptions WorkflowCheckpointStore WorkflowCheckpointLease WorkflowCheckpointValue WorkflowJson",
  },
  {
    title: ["Approval and pause gates", "Approbations et pauses"],
    guide: "guide/advanced/approvals",
    names:
      "approvalTask pauseTask WorkflowGate WorkflowGateOptions WorkflowPauseRequest WorkflowDecision WorkflowDecisionRecord",
  },
  {
    title: ["Typed artifacts", "Artefacts typés"],
    guide: "guide/advanced/artifacts",
    names:
      "artifact publishArtifact readStoredArtifact artifactTask readArtifact fileArtifactStore ArtifactContract ArtifactContractOptions ArtifactIdentity ArtifactProducer ArtifactReference ArtifactStore JsonArtifactOptions PublishArtifactOptions ReadArtifactOptions ArtifactTaskOptions FileArtifactStoreOptions",
  },
  {
    title: ["Distributed execution", "Exécution distribuée"],
    guide: "guide/advanced/distributed",
    names:
      "sqliteTaskQueue serveTaskQueue httpTaskQueue runQueueWorker queuedTask QueueRequest QueueResult QueueJob QueueClaim QueueLease TaskQueue DurableTaskQueue QueueServerOptions QueueServer QueueClientOptions QueueHandlerContext QueueHandler QueueWorkerOptions QueuedTaskOptions",
  },
  {
    title: ["Outbound networking", "Réseau sortant"],
    guide: "guide/advanced/egress",
    names: "EgressPolicy",
  },
  {
    title: ["Speculative execution", "Exécution spéculative"],
    guide: "guide/advanced/speculation",
    names:
      "speculate SpeculationOptions SpeculationResult SpeculativeCandidate SpeculativeCandidateResult SpeculativeOutput SpeculativeHostSnapshot SpeculativeValidation",
  },
  {
    title: ["Firecracker prototype", "Prototype Firecracker"],
    guide: "guide/advanced/firecracker",
    names: "firecracker FirecrackerOptions",
  },
];
