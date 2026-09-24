export const groups = [
  {
    title: ["Workspaces", "Workspaces"],
    guide: "sandboxes/workspaces",
    names:
      "openWorkspace Workspace WorkspaceOptions WorkspaceRecord BranchPolicy Commit Disposal StageLimits LifecycleHooks",
  },
  {
    title: ["Sandboxes", "Sandboxes"],
    guide: "sandboxes/lifecycle",
    names: "createSandbox Sandbox SandboxOptions",
  },
  {
    title: ["Dispatch", "Dispatch"],
    guide: "agents/dispatch",
    names:
      "dispatch DispatchOptions DispatchResult WarmDispatchResult ContinuationOptions Execution Turn",
  },
  {
    title: ["Commands and terminal", "Commandes et terminal"],
    guide: "sandboxes/commands",
    names:
      "attach AttachOptions AttachResult Command CommandResult Channel VariableQuestion",
  },
  {
    title: ["Agents", "Agents"],
    guide: "agents/adapters",
    names:
      "claude codex ClaudeSettings CodexSettings agentVersions AgentAdapter AgentInput",
  },
  {
    title: ["Prompts and responses", "Prompts et réponses"],
    guide: "agents/responses",
    names:
      "Brief PromptVariables response ResponseSpec StandardValidator ResponseError",
  },
  {
    title: ["Conversations", "Conversations"],
    guide: "agents/conversations",
    names:
      "conversations ConversationFormat ConversationLocation ConversationContext ConversationRecord ConversationStore",
  },
  {
    title: ["Observability", "Observabilité"],
    guide: "agents/observability",
    names: "reporter ReporterOptions Logging AgentEvent AgentObservation Usage",
  },
  {
    title: ["Workflows", "Workflows"],
    guide: "workflows/graph",
    names:
      "task workflow WorkflowFailure Retry Task TaskContext TaskOptions TaskRecord TaskStatus Workflow WorkflowEvent WorkflowOptions WorkflowResult agentTask commandTask isolatedTask",
  },
  {
    title: ["Providers", "Providers"],
    guide: "providers/overview",
    names:
      "docker podman local vercel daytona ContainerOptions DependencyCache VercelOptions DaytonaOptions mountedProvider remoteProvider SandboxContext SandboxLease SandboxProvider TransferOptions Variables Volume",
  },
  {
    title: ["Errors", "Erreurs"],
    guide: "operations/recovery",
    names: "OutpostError recoveryDetails FaultCode",
  },
];
