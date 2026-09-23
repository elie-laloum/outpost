---
title: "Index de l’API"
description: "Index de l’API — Outpost API"
sidebar:
  order: 0
---

Chaque export public du package et de ses sous-chemins possède une page de référence. Les signatures sont extraites des déclarations TypeScript compilées et vérifiées en CI. Les guides expliquent les usages ; les contrats détaillent les champs exacts. Les contrats auxiliaires restent accessibles depuis les types qui les utilisent.

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
- [ClaudeSettings](./claudesettings/)
- [CodexSettings](./codexsettings/)
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

## Erreurs

- [OutpostError](./outposterror/)
- [recoveryDetails](./recoverydetails/)
- [FaultCode](./faultcode/)
