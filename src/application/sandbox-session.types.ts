import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import type { Agent } from "../domain/agent.types.ts";
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
  ): Promise<SelectedAgent>;
  restore(id: string, agent: Agent): Promise<void>;
  remember(agent: Agent, id: string): void;
}

export interface OperationGate {
  run<T>(action: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
