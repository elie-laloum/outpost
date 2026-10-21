export { openWorkspace } from "./application/outpost.ts";
export type { Workspace, WorkspaceOptions } from "./application/outpost.ts";
export type { DiffGuard } from "./domain/diff-guard.types.ts";
export type { WorkspaceRecord } from "./domain/ports.ts";
export { createAgentConflictResolver } from "./application/agent-conflict-resolver.ts";
export type {
  AgentConflictResolverOptions,
  ConflictContext,
  ConflictResolution,
  ConflictResolver,
  IntegrationOptions,
} from "./application/conflict-resolution.types.ts";
export {
  createWorkspace,
  restoreFileWorkspace,
  workspaceFingerprint,
} from "./application/file-workspace.ts";
export { prepareWorkspaceOutputs } from "./application/workspace-output-baseline.ts";
export {
  publishWorkspaceOutputs,
  inspectWorkspacePublication,
  recoverWorkspacePublication,
} from "./application/workspace-publication.ts";
export {
  snapshotWorkspaceFiles,
  restoreWorkspaceFiles,
} from "./infrastructure/workspace-snapshot.ts";
export type {
  FileWorkspace,
  FileWorkspaceOptions,
  GitWorkspace,
  GitWorkspaceOptions,
  CreatedWorkspace,
  FileWorkspaceRecoveryAuthorization,
} from "./application/file-workspace.types.ts";
export type {
  WorkspaceSource,
  FileWorkspaceSource,
  GitWorkspaceSource,
  WorkspaceSession,
  FileWorkspaceRecord,
  WorkspaceRuntime,
  WorkspaceRuntimeOptions,
  WorkspaceRetention,
  WorkspaceInput,
  WorkspaceOutputOptions,
  WorkspacePublication,
  WorkspaceFileEntry,
  WorkspaceAllocationRecord,
  WorkspaceConversationArchive,
  WorkspaceOutputBaseline,
} from "./domain/file-workspace.types.ts";
export {
  inspectWorkspacePathLocks,
  recoverWorkspacePathLock,
} from "./infrastructure/workspace-lock.ts";
export type { RestoreFileWorkspaceOptions } from "./application/file-workspace.types.ts";
export type {
  WorkspacePathLock,
  WorkspacePathRecoveryOptions,
} from "./infrastructure/workspace-lock.types.ts";
export type {
  PublicationJournal,
  PublicationOperation,
  PublicationDirectory,
  PublicationRecoveryOptions,
} from "./application/workspace-publication.types.ts";
export type {
  GitWorkspaceSandboxOptions,
  GitDispatchRequest,
} from "./application/file-workspace.types.ts";
export {
  inspectFileWorkspace,
  recoverFileWorkspace,
} from "./application/file-workspace-recovery.ts";
export type {
  FileWorkspaceInspection,
  FileWorkspaceInspectionOptions,
  FileWorkspaceRecoveryOptions,
} from "./application/file-workspace-recovery.types.ts";
