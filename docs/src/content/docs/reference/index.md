---
title: "API index"
description: "API index — Outpost API"
sidebar:
  order: 0
---

Every public export from the package and its subpaths has a reference page. Signatures are extracted from compiled TypeScript declarations and checked in CI. Guides explain usage; contracts list exact fields. Supporting contracts are linked from the types that use them.

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

## Commands and terminal

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
- [ClaudeSettings](./claudesettings/)
- [CodexSettings](./codexsettings/)
- [agentVersions](./agentversions/)
- [AgentAdapter](./agentadapter/)
- [AgentInput](./agentinput/)

## Prompts and responses

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

## Observability

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

## Remote transfers

- [FileManifestEntry](./filemanifestentry/)
- [FileTransfers](./filetransfers/)

## Recovery and retention

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

## Errors

- [OutpostError](./outposterror/)
- [recoveryDetails](./recoverydetails/)
- [FaultCode](./faultcode/)
