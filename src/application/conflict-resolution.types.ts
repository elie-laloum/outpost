import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import type { Command, CommandResult } from "../domain/command.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { Logging } from "../infrastructure/journal.types.ts";
import type { Workspace } from "./outpost.types.ts";

export interface IntegrationOptions {
  readonly onConflict?: ConflictResolver;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}

export type ConflictResolver = (
  context: ConflictContext,
) => Promise<ConflictResolution>;

export interface ConflictContext {
  readonly workspace: Workspace;
  readonly hostCommit: string;
  readonly candidateCommit: string;
  readonly conflicts: readonly string[];
  readonly signal: AbortSignal;
  readonly observation?: ObservationHub;
}

export interface ConflictResolution {
  readonly commit: string;
  readonly branch: string;
  readonly directory: string;
  readonly usage: Usage;
  readonly verification: CommandResult;
  readonly transcript?: string;
}

export interface AgentConflictResolverOptions {
  readonly sandboxProvider: SandboxProvider;
  readonly verify: Command;
  readonly instructions?: string;
  readonly observe?: (event: AgentObservation) => void;
  readonly logging?: Logging;
}
