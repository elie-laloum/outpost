import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import type { Agent } from "../domain/agent.types.ts";
import type { ConversationRecord } from "../domain/conversation.types.ts";
import type { FallbackRecord } from "../domain/fallback-agent.types.ts";
import type { Execution } from "./execution.types.ts";
import type { Variables } from "../domain/command.types.ts";
import type { SandboxLease, SandboxProvider } from "../domain/sandbox.types.ts";
import type { LifecycleHooks } from "../domain/workspace.types.ts";
import type { WorkspaceLease } from "../infrastructure/git/workspace.types.ts";
import type { SandboxOptions, Workspace } from "./outpost.types.ts";
import type { RemoteSync } from "./remote-workspace.types.ts";

export interface WorkspaceState {
  lease: WorkspaceLease;
  active: boolean;
  closed: boolean;
  hooks?: LifecycleHooks;
}

export interface ProvisionedSandbox {
  readyHooks(
    signal: AbortSignal,
    incremental?: boolean,
    observation?: import("../domain/observation.types.ts").ObservationHub,
  ): Promise<void>;
  readonly options: SandboxOptions;
  readonly sandboxProvider: SandboxProvider;
  readonly workspace: Workspace;
  readonly state: WorkspaceState;
  readonly owned: boolean;
  readonly stop: AbortController;
  readonly runtime: SandboxLease;
  readonly activity: ResourceActivity;
  readonly sync: RemoteSync | undefined;
  readonly prepared: Map<Agent, Agent>;
  readonly staging: string;
}

export interface SelectedAgent {
  readonly selected: Agent;
  readonly adapter: Agent;
  readonly executionLease: SandboxLease;
}

export interface SandboxAgents {
  selectAgent(
    agent: Agent | undefined,
    signal: AbortSignal,
    observation?: import("../domain/observation.types.ts").ObservationHub,
  ): Promise<SelectedAgent>;
  restore(
    id: string,
    agent: Agent,
    executionLease: SandboxLease,
  ): Promise<void>;
  remember(agent: Agent, id: string): void;
}

export interface OperationGate {
  run<T>(action: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface AuthenticatedAgent {
  readonly adapter: Agent;
  readonly variables: Variables;
}

export interface CandidateSession {
  readonly selected: Agent;
  readonly conversations: Set<string>;
  readonly captured: Map<string, ConversationRecord>;
  save(id: string): Promise<ConversationRecord>;
  conversation: string | undefined;
}

export interface CandidateExecution<T> {
  readonly session: CandidateSession;
  readonly execution: Execution<T>;
  readonly fallback?: FallbackRecord;
}

export interface PreparedCandidate {
  readonly session: CandidateSession;
  readonly adapter: Agent;
  readonly executionLease: SandboxLease;
}
