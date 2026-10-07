export const groups = [
  {
    id: "pricing",
    title: ["Pricing", "Tarification"],
    guide: "guide/budgets",
    names:
      "calculateUsageCost loadModelPrices ModelPricesOptions ModelPrice ModelPriceTable UsageCost WorkflowCostUnavailable",
  },
  {
    id: "decisions",
    title: ["Decisions", "Décisions"],
    guide: "guide/decisions",
    names:
      "defineDecision decide defineDecisionTask createSystemOneDecisionProvider defineHarnessModelRouting DecisionState ChoiceQuestion ScoreQuestion NoulQuestion DecisionQuestion DecisionQuestions DecisionOptions Decision ChoiceAnswer ScoreAnswer NoulAnswer DecisionAnswer DecisionAnswers DecisionProviderResult DecisionRequest DecisionProvider DecisionResult DecideOptions DecisionEvent DecisionTaskOptions SystemOneDecisionProviderOptions HarnessModelRoutingContext HarnessModelRoutingOptions HarnessModelRouting RoutingQuestion RoutingChoices ModelRouteEvent",
  },
  {
    id: "storage-transports",
    title: ["Storage transports", "Transports de stockage"],
    guide: "guide/storage",
    names:
      "createLocalTransport createS3Transport createArtifactStore createWorkflowCheckpointStore createTaskCacheStore recoverWorkflowCheckpoint readJournal createTransportConversations archiveRecovery materializeRecoveryArchive TransportConflict Transport TransportEntry TransportObject TransportReadOptions TransportWriteOptions TransportReference TransportStoreOptions LocalTransportOptions S3TransportOptions ArtifactStoreOptions CheckpointRecoveryOptions ReadJournalOptions TransportConversationOptions RecoveryArchiveOptions RecoveryArchiveRestoreOptions TaskCacheStoreOptions",
  },
  {
    id: "diagnostics",
    title: ["Diagnostics", "Diagnostics"],
    guide: "guide/diagnostics",
    names:
      "diagnoseSandbox SandboxDiagnosticOptions SandboxDiagnosticReport DiagnosticCapability DiagnosticCheck DiagnosticStatus DoctorAgent diagnoseAgentProtocol AgentProtocolReport",
  },
  {
    id: "workspaces",
    title: ["Workspaces", "Workspaces"],
    guide: "guide/repository-and-branch",
    names:
      "openWorkspace createAgentConflictResolver Workspace WorkspaceOptions WorkspaceRecord BranchPolicy DiffGuard IntegrationOptions ConflictResolver ConflictContext ConflictResolution AgentConflictResolverOptions Commit Disposal StageLimits LifecycleHooks",
  },
  {
    id: "sandboxes",
    title: ["Sandboxes", "Sandboxes"],
    guide: "guide/sandbox-sessions",
    names: "createSandbox Sandbox SandboxOptions",
  },
  {
    id: "dispatch",
    title: ["Dispatch", "Dispatch"],
    guide: "guide/first-request",
    names:
      "dispatch createSteering WatchdogOptions RepetitionPolicy StuckInstruction StuckEvent DispatchOptions DispatchResult WarmDispatchResult RunReport RunReportOptions RunReportDiff RunReportFile RunReportFailure ContinuationOptions Execution Turn SteeringMode SteeringState Steering SteeringDelivery SteeringSendOptions",
  },
  {
    id: "commands",
    title: ["Commands and terminal", "Commandes et terminal"],
    guide: "guide/sandbox-sessions",
    names:
      "attach AttachOptions AttachResult Command CommandResult Channel VariableQuestion",
  },
  {
    id: "agents",
    title: ["Agents", "Agents"],
    guide: "guide/choose-an-agent",
    names:
      "defineAgentProfile AgentProfile AgentProfileOptions AgentProfileTool createAgent createFallbackAgent Agent AgentOptions CliAgent CustomAgent AgentModel ModelSpec ModelReasoning DispatchAgent FallbackTrigger FallbackAgent FallbackAgentOptions FallbackCandidate FallbackAttempt FallbackRecord",
  },
  {
    id: "harness",
    title: ["Harness", "Harness"],
    guide: "guide/harness",
    names:
      "createHarness defineHarnessSubagent HarnessSubagent HarnessSubagentInput HarnessSubagentOptions defineHarnessTool defineHarnessToolset defineHarnessInstructions defineMcpPrompt createAntigravityHarness createClaudeHarness createCodexHarness createCopilotHarness createKimiHarness AgentHarness CliHarness Harness HarnessOptions HarnessLimits HarnessToolExecution HarnessInstructions HarnessInstructionContext HarnessMcpContext McpPromptOptions HarnessInstructionSource HarnessInstructionsOption HarnessTool HarnessToolOptions HarnessToolContext HarnessToolEvent HarnessToolset HarnessToolsetOptions JsonSchema StandardJsonSchema ToolOutput ToolValidation defineHarnessHook defineHarnessPermissions HarnessHook HarnessHookContext HarnessHookDecisions HarnessHookEvents HarnessHookInput HarnessHookOptions HarnessHookPhase HarnessHookResult HarnessToolResultView HarnessPermissionRule HarnessPermissions HarnessPermissionsOptions PermissionDecision PermissionEffect ToolResources createHarnessFileTools createHarnessEditTools createHarnessSearchTools createHarnessGitTools createHarnessShellTools ShellToolsOptions defineHarnessContextStrategy truncateToolResults summarizeHistory HarnessContextInput HarnessContextResult HarnessContextStrategy HarnessContextStrategyOptions SummarizeHistoryOptions TruncateToolResultsOptions defineHarnessSkill HarnessSkill HarnessSkillOptions AgentAuthentication AccountCredential UsageCredential AntigravitySettings ClaudeSettings CodexSettings CodexModelProvider CopilotSettings KimiSettings McpServer McpServers McpStdioServer McpHttpServer McpToolFilter McpClientCredentials agentVersions AgentAdapter AgentInput AgentLiveInput AgentLiveSession AgentLiveRead AgentConfiguration ConfigurationFile HostConfiguration",
  },
  {
    id: "prompts-responses",
    title: ["Prompts and responses", "Prompts et réponses"],
    guide: "guide/typed-responses",
    names:
      "Brief PromptVariables defineTextResponse defineJsonResponse ResponseSpec StandardValidator ResponseError",
  },
  {
    id: "conversations",
    title: ["Conversations", "Conversations"],
    guide: "guide/conversations",
    names:
      "createClaudeConversations createCodexConversations createCopilotConversations createKimiConversations createTranscriptConversations createSessionBundleConversations createHarnessConversations conversations ConversationFormat ConversationLocation TranscriptConversationLayout SessionBundleProfile SessionBundleFiles SessionBundleHelpers SessionBundleRelocation ConversationContext ConversationRecord ConversationStore NativeConversationStore",
  },
  {
    id: "observability",
    title: ["Observability", "Observabilité"],
    guide: "guide/observability",
    names:
      "createRunObserver readRun watchRun RunStatus RunTask RunPass RunDispatch RunError RunSnapshot RunEvent RunObserverOptions RunObserver ReadRunOptions WatchRunOptions createObservationHub Observation ObservationScope ObservationSource ObservationEvent OperationEvent ObservationHub ObservationHubOptions ObservationSink createReporter ReporterOptions createCustomReporter CustomReporter CustomReporterOptions ReporterHandlers DispatchTelemetry DispatchTelemetrySession DispatchTelemetryOutcome Logging createReplayAgent ReplayDivergence ReplayAgent ReplayAgentOptions ReplayTurn ReplayDecisionEvent ReplayFailure ReplayDivergenceDetails ReplayDivergenceKind ReplayDivergencePolicy WorkspaceCommitsEvent RecordedCommit RecordedIdentity RecordedRevision AgentEvent AgentObservation Usage ModelUsage createOpenTelemetryObserver OpenTelemetryOptions OpenTelemetryObserver",
  },
  {
    id: "workflows",
    title: ["Workflows", "Workflows"],
    guide: "guide/task-dependencies",
    names:
      "defineLoopTask LoopTaskExhausted LoopCheckResult LoopTaskContext LoopTaskOptions LoopRoundRecord defineTask defineWorkflow WorkflowFailure Retry Task TaskContext TaskOptions TaskRecord TaskStatus Workflow WorkflowEvent WorkflowTelemetry WorkflowOptions WorkflowBudget WorkflowUsage WorkflowBudgetExceeded WorkflowUsageUnavailable WorkflowResult WorkflowTerminationCode defineAgentTask defineCommandTask defineIsolatedTask defineInteractiveAgentTask InteractiveAgentTaskOptions InteractiveAgentResult WorkflowInputQuestion WorkflowInputRequest WorkflowAnswer WorkflowAnswerRecord TaskInteraction TaskInteractionRecord TaskInteractionContext WorkflowQuotaPolicy WorkflowQuotaPause QuotaResumePolicy repositoryFingerprint TaskCacheOptions TaskCacheStore TaskCacheEntry TaskCacheAccessOptions TaskCacheMode TaskCacheOutcome",
  },
  {
    id: "providers",
    title: ["Providers", "Providers"],
    guide: "guide/choose-a-sandbox",
    names:
      "createDockerSandboxProvider createPodmanSandboxProvider createLocalSandboxProvider createVercelSandboxProvider createDaytonaSandboxProvider createFirecrackerSandboxProvider FirecrackerOptions ContainerOptions DependencyCache EgressPolicy VercelOptions DaytonaOptions createMountedSandboxProvider createRemoteSandboxProvider SandboxContext SandboxLease SandboxProvider TransferOptions FileTransfers FileManifestEntry Variables Volume",
  },
  {
    id: "model-providers",
    title: ["Model providers", "Fournisseurs de modèles"],
    guide: "guide/model-providers",
    names:
      "createOpenAIModelProvider createAnthropicModelProvider AnthropicModelProviderOptions OpenAIModelProviderOptions ModelProvider ModelRequest ModelResult ModelMessage ModelContentBlock ModelTextBlock ModelToolCallBlock ModelToolResultBlock ModelReasoningBlock ModelToolSpec ModelStopReason ModelStreamEvent",
  },
  {
    id: "recovery-retention",
    title: ["Recovery and retention", "Récupération et rétention"],
    guide: "guide/retention",
    names:
      "planRecoveryRetention pruneRecoveryRetention assertRecoveryQuota RecoveryRetentionPolicy RecoveryRetentionOptions RecoveryRetentionPlan RecoveryRetentionEntry RecoveryPruneResult RecoveryQuotaOptions verifyRecoveryTransfer RecoveryVerification RecoveryVerificationOptions",
  },
  {
    id: "errors",
    title: ["Errors", "Erreurs"],
    guide: "guide/error-handling",
    names:
      "OutpostError recoveryDetails quotaFault unavailableFault FaultCode QuotaFault UnavailableFault",
  },
  {
    id: "storage-reservations",
    title: ["Storage reservations", "Réservations de stockage"],
    guide: "guide/retention",
    names:
      "reserveRecoveryStorage RecoveryStorageReservationOptions StorageReservation StorageReservationOptions",
  },
  {
    id: "recovery-restoration",
    title: ["Recovery restoration", "Restauration de récupération"],
    guide: "guide/recovery",
    names:
      "planRecoveryRestore restoreRecoveryTransfer RecoveryRestoreOptions RecoveryRestorePlan RecoveryRestoreResult",
  },
  {
    id: "resource-activity",
    title: ["Resource activity", "Activité des ressources"],
    guide: "guide/recovery",
    names:
      "inspectRecovery RecoveryInspection RecoveryInspectionOptions ResourceActivityRecord ResourceInspection ResourceInspectionEntry ResourceOperation ResourceOperationKind ResourceOperationResult ResourcePhase",
  },
  {
    id: "checkpoints",
    title: ["Workflow checkpoints", "Checkpoints de workflow"],
    guide: "guide/durable-runs",
    names:
      "WorkflowCheckpoint WorkflowCheckpointOptions WorkflowCheckpointStore WorkflowCheckpointLease WorkflowCheckpointValue WorkflowJson",
  },
  {
    id: "approvals",
    title: ["Approval and pause gates", "Approbations et pauses"],
    guide: "guide/approvals",
    names:
      "defineApprovalTask definePauseTask signWorkflowDecision createEd25519DecisionVerifier WorkflowDecisionProof WorkflowDecisionVerification WorkflowDecisionVerifier WorkflowDecisionSigningOptions WorkflowApproverKey WorkflowDecisionVerifierOptions WorkflowGate WorkflowGateOptions WorkflowPauseRequest WorkflowDecision WorkflowDecisionRecord",
  },
  {
    id: "artifacts",
    title: ["Typed artifacts", "Artefacts typés"],
    guide: "guide/artifacts",
    names:
      "defineJsonArtifact defineBinaryArtifact publishArtifact readStoredArtifact defineArtifactTask readArtifact ArtifactContract ArtifactContractOptions ArtifactIdentity ArtifactProducer ArtifactReference ArtifactStore JsonArtifactOptions PublishArtifactOptions ReadArtifactOptions ArtifactTaskOptions",
  },
  {
    id: "distributed-execution",
    title: ["Distributed execution", "Exécution distribuée"],
    guide: "guide/job-queues",
    names:
      "createSqliteTaskQueue createBullMQTaskQueue BullMQTaskQueue BullMQTaskQueueOptions serveTaskQueue createHttpTaskQueue runQueueWorker defineQueuedTask QueueRequest QueueResult QueueQuota QueueJob QueueClaim QueueLease TaskQueue DurableTaskQueue QueueServerOptions QueueServer QueueClientOptions QueueHandlerContext QueueHandler QueueWorkerOptions QueuedTaskOptions",
  },
  {
    id: "triggers",
    title: ["Triggers", "Déclencheurs"],
    guide: "guide/webhooks",
    names:
      "createCronSchedule runSchedules serveTriggers createGithubWebhook createGitlabWebhook createSlackSource createStandardWebhook labelAdded commandIssued defineWorkflowJob CronSchedule CronOptions TriggerSchedule RunSchedulesOptions ScheduleFailure TriggerJob TriggerJobInput TriggerRoute TriggerServerOptions TriggerServer TriggerFailure TriggerEvent TriggerHttpRequest TriggerOutcome TriggerReply TriggerSecret TriggerSource GithubWebhookOptions GitlabWebhookOptions GitlabSigningOptions GitlabTokenOptions SlackRequestOptions StandardWebhookOptions TriggerLabel TriggerCommand WorkflowJobOptions WorkflowJobContext WorkflowJobCheckpoint WorkflowJobStartOptions",
  },
  {
    id: "speculation",
    title: ["Speculative execution", "Exécution spéculative"],
    experimental: [
      "speculate",
      "recoverSpeculation",
      "checkSpeculationIntegration",
      "SpeculationDurability",
      "SpeculationRecoveryOptions",
      "SpeculationIntegration",
      "SpeculationOptions",
      "SpeculationResult",
      "SpeculativeCandidate",
      "SpeculativeCandidateResult",
      "SpeculativeOutput",
      "SpeculativeHostSnapshot",
      "SpeculativeValidation",
    ],
    guide: "guide/speculation",
    names:
      "speculate recoverSpeculation checkSpeculationIntegration SpeculationDurability SpeculationRecoveryOptions SpeculationIntegration SpeculationOptions SpeculationResult SpeculativeCandidate SpeculativeCandidateResult SpeculativeOutput SpeculativeHostSnapshot SpeculativeValidation",
  },
];

// Guide page with the complete example for a symbol when it differs from its family's page.
const guidePages = {
  "durable-runs":
    "createWorkflowCheckpointStore recoverWorkflowCheckpoint CheckpointRecoveryOptions",
  "object-storage": "createS3Transport S3TransportOptions",
  artifacts: "createArtifactStore ArtifactStoreOptions",
  "task-cache":
    "createTaskCacheStore TaskCacheStoreOptions repositoryFingerprint TaskCacheOptions TaskCacheStore TaskCacheEntry TaskCacheAccessOptions TaskCacheMode TaskCacheOutcome",
  journals: "readJournal ReadJournalOptions Logging",
  conversations:
    "createTransportConversations TransportConversationOptions ContinuationOptions WarmDispatchResult",
  recovery:
    "archiveRecovery materializeRecoveryArchive RecoveryArchiveOptions RecoveryArchiveRestoreOptions",
  "environment-setup": "LifecycleHooks DependencyCache",
  "limits-and-cancellation": "StageLimits",
  steering:
    "createSteering SteeringMode SteeringState Steering SteeringDelivery SteeringSendOptions",
  "fallback-agents":
    "createFallbackAgent FallbackTrigger FallbackAgent FallbackAgentOptions FallbackCandidate FallbackAttempt FallbackRecord unavailableFault UnavailableFault",
  subagents:
    "defineHarnessSubagent HarnessSubagent HarnessSubagentInput HarnessSubagentOptions",
  "harness-tools":
    "defineHarnessTool defineHarnessToolset HarnessTool HarnessToolOptions HarnessToolContext HarnessToolEvent HarnessToolset HarnessToolsetOptions JsonSchema StandardJsonSchema ToolOutput ToolValidation createHarnessFileTools createHarnessEditTools createHarnessSearchTools createHarnessGitTools createHarnessShellTools ShellToolsOptions",
  "harness-context":
    "defineHarnessInstructions HarnessInstructions HarnessInstructionContext HarnessInstructionSource HarnessInstructionsOption defineHarnessContextStrategy truncateToolResults summarizeHistory HarnessContextInput HarnessContextResult HarnessContextStrategy HarnessContextStrategyOptions SummarizeHistoryOptions TruncateToolResultsOptions defineHarnessSkill HarnessSkill HarnessSkillOptions",
  "mcp-servers":
    "defineMcpPrompt McpPromptOptions HarnessMcpContext McpServer McpServers McpStdioServer McpHttpServer McpToolFilter",
  "mcp-oauth": "McpClientCredentials",
  "harness-permissions":
    "defineHarnessHook defineHarnessPermissions HarnessHook HarnessHookContext HarnessHookDecisions HarnessHookEvents HarnessHookInput HarnessHookOptions HarnessHookPhase HarnessHookResult HarnessToolResultView HarnessPermissionRule HarnessPermissions HarnessPermissionsOptions PermissionDecision PermissionEffect ToolResources",
  antigravity: "createAntigravityHarness AntigravitySettings",
  "claude-code": "createClaudeHarness ClaudeSettings",
  codex: "createCodexHarness CodexSettings CodexModelProvider",
  "copilot-cli": "createCopilotHarness CopilotSettings",
  "kimi-code": "createKimiHarness KimiSettings",
  authentication: "AgentAuthentication AccountCredential UsageCredential",
  "agent-images": "agentVersions",
  "custom-agents":
    "CliHarness AgentAdapter AgentInput AgentLiveInput AgentLiveSession AgentLiveRead AgentConfiguration ConfigurationFile HostConfiguration",
  briefs: "Brief PromptVariables",
  "conversation-formats":
    "createTranscriptConversations createSessionBundleConversations TranscriptConversationLayout SessionBundleProfile SessionBundleFiles SessionBundleHelpers SessionBundleRelocation",
  observability:
    "createObservationHub Observation ObservationScope ObservationSource ObservationEvent OperationEvent ObservationHub ObservationHubOptions ObservationSink createCustomReporter CustomReporter CustomReporterOptions ReporterHandlers DispatchTelemetry DispatchTelemetrySession DispatchTelemetryOutcome createOpenTelemetryObserver OpenTelemetryOptions OpenTelemetryObserver WorkflowTelemetry",
  "run-state":
    "createRunObserver readRun watchRun RunStatus RunTask RunPass RunDispatch RunError RunSnapshot RunEvent RunObserverOptions RunObserver ReadRunOptions WatchRunOptions",
  "record-replay":
    "createReplayAgent ReplayDivergence ReplayAgent ReplayAgentOptions ReplayTurn ReplayDecisionEvent ReplayFailure ReplayDivergenceDetails ReplayDivergenceKind ReplayDivergencePolicy WorkspaceCommitsEvent RecordedCommit RecordedIdentity RecordedRevision",
  budgets:
    "Usage WorkflowBudget WorkflowUsage WorkflowBudgetExceeded WorkflowUsageUnavailable",
  "verification-loops":
    "defineLoopTask LoopTaskExhausted LoopCheckResult LoopTaskContext LoopTaskOptions LoopRoundRecord",
  "concurrency-and-retries": "Retry",
  "interactive-tasks":
    "defineInteractiveAgentTask InteractiveAgentTaskOptions InteractiveAgentResult WorkflowInputQuestion WorkflowInputRequest WorkflowAnswer WorkflowAnswerRecord TaskInteraction TaskInteractionRecord TaskInteractionContext",
  "quota-pauses":
    "WorkflowQuotaPolicy WorkflowQuotaPause QuotaResumePolicy quotaFault QuotaFault",
  containers:
    "createDockerSandboxProvider createPodmanSandboxProvider ContainerOptions Volume",
  "host-process": "createLocalSandboxProvider",
  "cloud-sandboxes":
    "createVercelSandboxProvider createDaytonaSandboxProvider VercelOptions DaytonaOptions",
  firecracker: "createFirecrackerSandboxProvider FirecrackerOptions",
  "network-restrictions": "EgressPolicy",
  "custom-sandbox-providers":
    "createMountedSandboxProvider createRemoteSandboxProvider SandboxContext SandboxLease SandboxProvider TransferOptions FileTransfers FileManifestEntry",
  "environment-variables": "Variables",
  retention:
    "planRecoveryRetention pruneRecoveryRetention assertRecoveryQuota RecoveryRetentionPolicy RecoveryRetentionOptions RecoveryRetentionPlan RecoveryRetentionEntry RecoveryPruneResult RecoveryQuotaOptions",
  "error-handling": "OutpostError FaultCode",
  "redis-workers":
    "createBullMQTaskQueue BullMQTaskQueue BullMQTaskQueueOptions",
  "cron-schedules":
    "createCronSchedule runSchedules CronSchedule CronOptions TriggerSchedule RunSchedulesOptions ScheduleFailure",
  "job-queues":
    "defineWorkflowJob WorkflowJobOptions WorkflowJobContext WorkflowJobCheckpoint WorkflowJobStartOptions",
};

export const symbolGuides = Object.fromEntries(
  Object.entries(guidePages).flatMap(([page, names]) =>
    names.split(" ").map((name) => [name, `guide/${page}`]),
  ),
);
