export const groups = [
  {
    id: "storage-transports",
    title: ["Storage transports", "Transports de stockage"],
    guide: "guide/operations/storage-transports",
    names:
      "localTransport s3Transport artifactStore workflowCheckpointStore taskCacheStore recoverWorkflowCheckpoint readJournal transportConversations archiveRecovery materializeRecoveryArchive TransportConflict Transport TransportEntry TransportObject TransportReadOptions TransportWriteOptions TransportReference TransportStoreOptions LocalTransportOptions S3TransportOptions ArtifactStoreOptions CheckpointRecoveryOptions ReadJournalOptions TransportConversationOptions RecoveryArchiveOptions RecoveryArchiveRestoreOptions TaskCacheStoreOptions",
  },
  {
    id: "diagnostics",
    title: ["Diagnostics", "Diagnostics"],
    guide: "guide/operations/doctor",
    names:
      "diagnoseSandbox SandboxDiagnosticOptions SandboxDiagnosticReport DiagnosticCapability DiagnosticCheck DiagnosticStatus DoctorAgent diagnoseAgentProtocol AgentProtocolReport",
  },
  {
    id: "workspaces",
    title: ["Workspaces", "Workspaces"],
    guide: "guide/environment/workspaces",
    names:
      "openWorkspace Workspace WorkspaceOptions WorkspaceRecord BranchPolicy Commit Disposal StageLimits LifecycleHooks",
  },
  {
    id: "sandboxes",
    title: ["Sandboxes", "Sandboxes"],
    guide: "guide/environment/lifecycle",
    names: "createSandbox Sandbox SandboxOptions",
  },
  {
    id: "dispatch",
    title: ["Dispatch", "Dispatch"],
    guide: "guide/agents/dispatch",
    names:
      "dispatch DispatchOptions DispatchResult WarmDispatchResult ContinuationOptions Execution Turn",
  },
  {
    id: "commands",
    title: ["Commands and terminal", "Commandes et terminal"],
    guide: "guide/environment/commands",
    names:
      "attach AttachOptions AttachResult Command CommandResult Channel VariableQuestion",
  },
  {
    id: "agents",
    title: ["Agents", "Agents"],
    guide: "guide/agents/adapters",
    names:
      "agent fallbackAgent Agent AgentOptions CliAgent CustomAgent AgentModel ModelSpec ModelReasoning DispatchAgent FallbackTrigger FallbackAgent FallbackAgentOptions FallbackCandidate FallbackAttempt FallbackRecord",
  },
  {
    id: "harness",
    title: ["Harness", "Harness"],
    guide: "guide/agents/harness",
    names:
      "harness defineHarnessSubagent HarnessSubagent HarnessSubagentInput HarnessSubagentOptions defineHarnessTool defineHarnessToolset defineHarnessInstructions antigravityHarness claudeHarness codexHarness copilotHarness kimiHarness AgentHarness CliHarness Harness HarnessOptions HarnessLimits HarnessToolExecution HarnessInstructions HarnessInstructionContext HarnessInstructionSource HarnessInstructionsOption HarnessTool HarnessToolOptions HarnessToolContext HarnessToolEvent HarnessToolset HarnessToolsetOptions JsonSchema StandardJsonSchema ToolOutput ToolValidation defineHarnessHook defineHarnessPermissions HarnessHook HarnessHookContext HarnessHookDecisions HarnessHookEvents HarnessHookInput HarnessHookOptions HarnessHookPhase HarnessHookResult HarnessToolResultView HarnessPermissionRule HarnessPermissions HarnessPermissionsOptions PermissionDecision PermissionEffect ToolResources harnessFileTools harnessEditTools harnessSearchTools harnessGitTools harnessShellTools ShellToolsOptions defineHarnessContextStrategy truncateToolResults summarizeHistory HarnessContextInput HarnessContextResult HarnessContextStrategy HarnessContextStrategyOptions SummarizeHistoryOptions TruncateToolResultsOptions defineHarnessSkill HarnessSkill HarnessSkillOptions AgentAuthentication AccountCredential UsageCredential AntigravitySettings ClaudeSettings CodexSettings CodexModelProvider CopilotSettings KimiSettings agentVersions AgentAdapter AgentInput",
  },
  {
    id: "prompts-responses",
    title: ["Prompts and responses", "Prompts et réponses"],
    guide: "guide/agents/responses",
    names:
      "Brief PromptVariables response ResponseSpec StandardValidator ResponseError",
  },
  {
    id: "conversations",
    title: ["Conversations", "Conversations"],
    guide: "guide/agents/conversations",
    names:
      "conversations harnessConversations ConversationFormat StoredConversationFormat ConversationLocation ConversationContext ConversationRecord ConversationStore",
  },
  {
    id: "observability",
    title: ["Observability", "Observabilité"],
    guide: "guide/agents/observability",
    names:
      "createObservationHub Observation ObservationScope ObservationSource ObservationEvent OperationEvent ObservationHub ObservationHubOptions ObservationSink reporter ReporterOptions createReporter CustomReporter CustomReporterOptions ReporterHandlers DispatchTelemetry DispatchTelemetrySession DispatchTelemetryOutcome Logging replayAgent ReplayDivergence ReplayAgent ReplayAgentOptions ReplayTurn ReplayFailure ReplayDivergenceDetails ReplayDivergenceKind ReplayDivergencePolicy WorkspaceCommitsEvent RecordedCommit RecordedIdentity RecordedRevision AgentEvent AgentObservation Usage openTelemetry OpenTelemetryOptions OpenTelemetryObserver",
  },
  {
    id: "workflows",
    title: ["Workflows", "Workflows"],
    guide: "guide/workflows/graph",
    names:
      "loopTask LoopTaskExhausted LoopCheckResult LoopTaskContext LoopTaskOptions LoopRoundRecord task workflow WorkflowFailure Retry Task TaskContext TaskOptions TaskRecord TaskStatus Workflow WorkflowEvent WorkflowTelemetry WorkflowOptions WorkflowBudget WorkflowUsage WorkflowBudgetExceeded WorkflowUsageUnavailable WorkflowResult agentTask commandTask isolatedTask interactiveAgentTask InteractiveAgentTaskOptions InteractiveAgentResult WorkflowInputQuestion WorkflowInputRequest WorkflowAnswer WorkflowAnswerRecord TaskInteraction TaskInteractionRecord TaskInteractionContext WorkflowQuotaPolicy WorkflowQuotaPause QuotaResumePolicy repositoryFingerprint TaskCacheOptions TaskCacheStore TaskCacheEntry TaskCacheAccessOptions TaskCacheMode TaskCacheOutcome",
  },
  {
    id: "providers",
    title: ["Providers", "Providers"],
    experimental: ["firecrackerSandboxProvider", "FirecrackerOptions"],
    guide: "guide/environment/providers/overview",
    names:
      "dockerSandboxProvider podmanSandboxProvider localSandboxProvider vercelSandboxProvider daytonaSandboxProvider firecrackerSandboxProvider FirecrackerOptions ContainerOptions DependencyCache EgressPolicy VercelOptions DaytonaOptions mountedSandboxProvider remoteSandboxProvider SandboxContext SandboxLease SandboxProvider TransferOptions FileTransfers FileManifestEntry Variables Volume",
  },
  {
    id: "model-providers",
    title: ["Model providers", "Fournisseurs de modèles"],
    guide: "guide/advanced/model-providers",
    names:
      "openaiModelProvider anthropicModelProvider AnthropicModelProviderOptions OpenAIModelProviderOptions ModelProvider ModelRequest ModelResult ModelMessage ModelContentBlock ModelTextBlock ModelToolCallBlock ModelToolResultBlock ModelReasoningBlock ModelToolSpec ModelStopReason ModelStreamEvent",
  },
  {
    id: "recovery-retention",
    title: ["Recovery and retention", "Récupération et rétention"],
    guide: "guide/operations/recovery",
    names:
      "planRecoveryRetention pruneRecoveryRetention assertRecoveryQuota RecoveryRetentionPolicy RecoveryRetentionOptions RecoveryRetentionPlan RecoveryRetentionEntry RecoveryPruneResult RecoveryQuotaOptions verifyRecoveryTransfer RecoveryVerification RecoveryVerificationOptions",
  },
  {
    id: "errors",
    title: ["Errors", "Erreurs"],
    guide: "guide/operations/recovery",
    names:
      "OutpostError recoveryDetails quotaFault unavailableFault FaultCode QuotaFault UnavailableFault",
  },
  {
    id: "storage-reservations",
    title: ["Storage reservations", "Réservations de stockage"],
    guide: "guide/operations/storage-retention",
    names:
      "reserveRecoveryStorage RecoveryStorageReservationOptions StorageReservation StorageReservationOptions",
  },
  {
    id: "recovery-restoration",
    title: ["Recovery restoration", "Restauration de récupération"],
    guide: "guide/operations/recovery-restoration",
    names:
      "planRecoveryRestore restoreRecoveryTransfer RecoveryRestoreOptions RecoveryRestorePlan RecoveryRestoreResult",
  },
  {
    id: "resource-activity",
    title: ["Resource activity", "Activité des ressources"],
    guide: "guide/operations/recovery",
    names:
      "inspectRecovery RecoveryInspection RecoveryInspectionOptions ResourceActivityRecord ResourceInspection ResourceInspectionEntry ResourceOperation ResourceOperationKind ResourceOperationResult ResourcePhase",
  },
  {
    id: "checkpoints",
    title: ["Workflow checkpoints", "Checkpoints de workflow"],
    guide: "guide/advanced/checkpoints",
    names:
      "WorkflowCheckpoint WorkflowCheckpointOptions WorkflowCheckpointStore WorkflowCheckpointLease WorkflowCheckpointValue WorkflowJson",
  },
  {
    id: "approvals",
    title: ["Approval and pause gates", "Approbations et pauses"],
    guide: "guide/advanced/approvals",
    names:
      "approvalTask pauseTask signWorkflowDecision ed25519DecisionVerifier WorkflowDecisionProof WorkflowDecisionVerification WorkflowDecisionVerifier WorkflowDecisionSigningOptions WorkflowApproverKey WorkflowDecisionVerifierOptions WorkflowGate WorkflowGateOptions WorkflowPauseRequest WorkflowDecision WorkflowDecisionRecord",
  },
  {
    id: "artifacts",
    title: ["Typed artifacts", "Artefacts typés"],
    guide: "guide/advanced/artifacts",
    names:
      "artifact publishArtifact readStoredArtifact artifactTask readArtifact ArtifactContract ArtifactContractOptions ArtifactIdentity ArtifactProducer ArtifactReference ArtifactStore JsonArtifactOptions PublishArtifactOptions ReadArtifactOptions ArtifactTaskOptions",
  },
  {
    id: "distributed-execution",
    title: ["Distributed execution", "Exécution distribuée"],
    guide: "guide/advanced/distributed",
    names:
      "sqliteTaskQueue bullmqTaskQueue BullMQTaskQueue BullMQTaskQueueOptions serveTaskQueue httpTaskQueue runQueueWorker queuedTask QueueRequest QueueResult QueueQuota QueueJob QueueClaim QueueLease TaskQueue DurableTaskQueue QueueServerOptions QueueServer QueueClientOptions QueueHandlerContext QueueHandler QueueWorkerOptions QueuedTaskOptions",
  },
  {
    id: "speculation",
    title: ["Speculative execution", "Exécution spéculative"],
    guide: "guide/advanced/speculation",
    names:
      "speculate recoverSpeculation checkSpeculationIntegration SpeculationDurability SpeculationRecoveryOptions SpeculationIntegration SpeculationOptions SpeculationResult SpeculativeCandidate SpeculativeCandidateResult SpeculativeOutput SpeculativeHostSnapshot SpeculativeValidation",
  },
];
