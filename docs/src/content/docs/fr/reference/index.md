---
title: "Index de l’API"
description: "Index de l’API — Outpost API"
sidebar:
  order: 0
---

Chaque export public du package et de ses sous-chemins possède une page de référence. Les signatures sont extraites des déclarations TypeScript compilées et vérifiées en CI. Les guides expliquent les usages ; les contrats détaillent les champs exacts. Les contrats auxiliaires restent accessibles depuis les types qui les utilisent.

## Diagnostics

- [diagnoseSandbox](./diagnosesandbox/)
- [SandboxDiagnosticOptions](./sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](./sandboxdiagnosticreport/)
- [DiagnosticCapability](./diagnosticcapability/)
- [DiagnosticCheck](./diagnosticcheck/)
- [DiagnosticStatus](./diagnosticstatus/)
- [DoctorAgent](./doctoragent/)
- [diagnoseAgentProtocol](./diagnoseagentprotocol/)
- [AgentProtocolReport](./agentprotocolreport/)

## Workspaces

- [openWorkspace](./openworkspace/)
- [Workspace](./workspace/)
- [WorkspaceOptions](./workspaceoptions/)
- [WorkspaceRecord](./workspacerecord/)
- [BranchPolicy](./branchpolicy/)
- [Commit](./commit/)
- [Disposal](./disposal/)
- [StageLimits](./stagelimits/)
- [LifecycleHooks](./lifecyclehooks/)

## Sandboxes

- [createSandbox](./createsandbox/)
- [Sandbox](./sandbox/)
- [SandboxOptions](./sandboxoptions/)

## Dispatch

- [dispatch](./dispatch/)
- [DispatchOptions](./dispatchoptions/)
- [DispatchResult](./dispatchresult/)
- [WarmDispatchResult](./warmdispatchresult/)
- [ContinuationOptions](./continuationoptions/)
- [Execution](./execution/)
- [Turn](./turn/)

## Commandes et terminal

- [attach](./attach/)
- [AttachOptions](./attachoptions/)
- [AttachResult](./attachresult/)
- [Command](./command/)
- [CommandResult](./commandresult/)
- [Channel](./channel/)
- [VariableQuestion](./variablequestion/)

## Agents

- [claude](./claude/)
- [codex](./codex/)
- [gemini](./gemini/)
- [ClaudeSettings](./claudesettings/)
- [CodexSettings](./codexsettings/)
- [CodexModelProvider](./codexmodelprovider/)
- [GeminiSettings](./geminisettings/)
- [agentVersions](./agentversions/)
- [AgentAdapter](./agentadapter/)
- [AgentInput](./agentinput/)

## Prompts et réponses

- [Brief](./brief/)
- [PromptVariables](./promptvariables/)
- [response](./response/)
- [ResponseSpec](./responsespec/)
- [StandardValidator](./standardvalidator/)
- [ResponseError](./responseerror/)

## Conversations

- [conversations](./conversations/)
- [ConversationFormat](./conversationformat/)
- [ConversationLocation](./conversationlocation/)
- [ConversationContext](./conversationcontext/)
- [ConversationRecord](./conversationrecord/)
- [ConversationStore](./conversationstore/)

## Observabilité

- [reporter](./reporter/)
- [ReporterOptions](./reporteroptions/)
- [Logging](./logging/)
- [AgentEvent](./agentevent/)
- [AgentObservation](./agentobservation/)
- [Usage](./usage/)
- [openTelemetry](./opentelemetry/)
- [OpenTelemetryOptions](./opentelemetryoptions/)
- [OpenTelemetryObserver](./opentelemetryobserver/)

## Workflows

- [task](./task/)
- [workflow](./workflow/)
- [WorkflowFailure](./workflowfailure/)
- [Retry](./retry/)
- [Task](./task/)
- [TaskContext](./taskcontext/)
- [TaskOptions](./taskoptions/)
- [TaskRecord](./taskrecord/)
- [TaskStatus](./taskstatus/)
- [Workflow](./workflow/)
- [WorkflowEvent](./workflowevent/)
- [WorkflowOptions](./workflowoptions/)
- [WorkflowBudget](./workflowbudget/)
- [WorkflowUsage](./workflowusage/)
- [WorkflowBudgetExceeded](./workflowbudgetexceeded/)
- [WorkflowResult](./workflowresult/)
- [agentTask](./agenttask/)
- [commandTask](./commandtask/)
- [isolatedTask](./isolatedtask/)

## Providers

- [docker](./docker/)
- [podman](./podman/)
- [local](./local/)
- [vercel](./vercel/)
- [daytona](./daytona/)
- [ContainerOptions](./containeroptions/)
- [DependencyCache](./dependencycache/)
- [VercelOptions](./verceloptions/)
- [DaytonaOptions](./daytonaoptions/)
- [mountedProvider](./mountedprovider/)
- [remoteProvider](./remoteprovider/)
- [SandboxContext](./sandboxcontext/)
- [SandboxLease](./sandboxlease/)
- [SandboxProvider](./sandboxprovider/)
- [TransferOptions](./transferoptions/)
- [Variables](./variables/)
- [Volume](./volume/)

## Transferts distants

- [FileManifestEntry](./filemanifestentry/)
- [FileTransfers](./filetransfers/)

## Récupération et rétention

- [planRecoveryRetention](./planrecoveryretention/)
- [pruneRecoveryRetention](./prunerecoveryretention/)
- [assertRecoveryQuota](./assertrecoveryquota/)
- [RecoveryRetentionPolicy](./recoveryretentionpolicy/)
- [RecoveryRetentionOptions](./recoveryretentionoptions/)
- [RecoveryRetentionPlan](./recoveryretentionplan/)
- [RecoveryRetentionEntry](./recoveryretentionentry/)
- [RecoveryPruneResult](./recoverypruneresult/)
- [RecoveryQuotaOptions](./recoveryquotaoptions/)
- [verifyRecoveryTransfer](./verifyrecoverytransfer/)
- [RecoveryVerification](./recoveryverification/)
- [RecoveryVerificationOptions](./recoveryverificationoptions/)

## Erreurs

- [OutpostError](./outposterror/)
- [recoveryDetails](./recoverydetails/)
- [FaultCode](./faultcode/)

## Réservations de stockage

- [reserveRecoveryStorage](./reserverecoverystorage/)
- [RecoveryStorageReservationOptions](./recoverystoragereservationoptions/)
- [StorageReservation](./storagereservation/)
- [StorageReservationOptions](./storagereservationoptions/)

## Restauration de récupération

- [planRecoveryRestore](./planrecoveryrestore/)
- [restoreRecoveryTransfer](./restorerecoverytransfer/)
- [RecoveryRestoreOptions](./recoveryrestoreoptions/)
- [RecoveryRestorePlan](./recoveryrestoreplan/)
- [RecoveryRestoreResult](./recoveryrestoreresult/)

## Activité des ressources

- [inspectRecovery](./inspectrecovery/)
- [RecoveryInspection](./recoveryinspection/)
- [RecoveryInspectionOptions](./recoveryinspectionoptions/)
- [ResourceActivityRecord](./resourceactivityrecord/)
- [ResourceInspection](./resourceinspection/)
- [ResourceInspectionEntry](./resourceinspectionentry/)
- [ResourceOperation](./resourceoperation/)
- [ResourceOperationKind](./resourceoperationkind/)
- [ResourceOperationResult](./resourceoperationresult/)
- [ResourcePhase](./resourcephase/)

## Checkpoints de workflow

- [fileWorkflowCheckpointStore](./fileworkflowcheckpointstore/)
- [FileWorkflowCheckpointOptions](./fileworkflowcheckpointoptions/)
- [WorkflowCheckpoint](./workflowcheckpoint/)
- [WorkflowCheckpointOptions](./workflowcheckpointoptions/)
- [WorkflowCheckpointStore](./workflowcheckpointstore/)
- [WorkflowCheckpointLease](./workflowcheckpointlease/)
- [WorkflowCheckpointValue](./workflowcheckpointvalue/)
- [WorkflowJson](./workflowjson/)

## Approbations et pauses

- [approvalTask](./approvaltask/)
- [pauseTask](./pausetask/)
- [WorkflowGate](./workflowgate/)
- [WorkflowGateOptions](./workflowgateoptions/)
- [WorkflowPauseRequest](./workflowpauserequest/)
- [WorkflowDecision](./workflowdecision/)
- [WorkflowDecisionRecord](./workflowdecisionrecord/)

## Artefacts typés

- [artifact](./artifact/)
- [publishArtifact](./publishartifact/)
- [readStoredArtifact](./readstoredartifact/)
- [artifactTask](./artifacttask/)
- [readArtifact](./readartifact/)
- [fileArtifactStore](./fileartifactstore/)
- [ArtifactContract](./artifactcontract/)
- [ArtifactContractOptions](./artifactcontractoptions/)
- [ArtifactIdentity](./artifactidentity/)
- [ArtifactProducer](./artifactproducer/)
- [ArtifactReference](./artifactreference/)
- [ArtifactStore](./artifactstore/)
- [JsonArtifactOptions](./jsonartifactoptions/)
- [PublishArtifactOptions](./publishartifactoptions/)
- [ReadArtifactOptions](./readartifactoptions/)
- [ArtifactTaskOptions](./artifacttaskoptions/)
- [FileArtifactStoreOptions](./fileartifactstoreoptions/)

## Exécution distribuée

- [sqliteTaskQueue](./sqlitetaskqueue/)
- [serveTaskQueue](./servetaskqueue/)
- [httpTaskQueue](./httptaskqueue/)
- [runQueueWorker](./runqueueworker/)
- [queuedTask](./queuedtask/)
- [QueueRequest](./queuerequest/)
- [QueueResult](./queueresult/)
- [QueueJob](./queuejob/)
- [QueueClaim](./queueclaim/)
- [QueueLease](./queuelease/)
- [TaskQueue](./taskqueue/)
- [DurableTaskQueue](./durabletaskqueue/)
- [QueueServerOptions](./queueserveroptions/)
- [QueueServer](./queueserver/)
- [QueueClientOptions](./queueclientoptions/)
- [QueueHandlerContext](./queuehandlercontext/)
- [QueueHandler](./queuehandler/)
- [QueueWorkerOptions](./queueworkeroptions/)
- [QueuedTaskOptions](./queuedtaskoptions/)

## Réseau sortant

- [EgressPolicy](./egresspolicy/)

## Exécution spéculative

- [speculate](./speculate/)
- [SpeculationOptions](./speculationoptions/)
- [SpeculationResult](./speculationresult/)
- [SpeculativeCandidate](./speculativecandidate/)
- [SpeculativeCandidateResult](./speculativecandidateresult/)
- [SpeculativeOutput](./speculativeoutput/)
- [SpeculativeHostSnapshot](./speculativehostsnapshot/)
- [SpeculativeValidation](./speculativevalidation/)

## Prototype Firecracker

- [firecracker](./firecracker/)
- [FirecrackerOptions](./firecrackeroptions/)
