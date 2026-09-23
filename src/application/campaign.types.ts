import type { AgentAdapter } from "../domain/agent.types.ts";
import type { Assignment, Backlog } from "../domain/backlog.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";

export interface CampaignEvent {
  readonly phase:
    "backlog" | "plan" | "implement" | "review" | "merge" | "close";
  readonly cycle: number;
  readonly issue?: string;
}

export interface CampaignOptions extends Omit<
  SandboxOptions,
  "workspace" | "branch" | "agent"
> {
  readonly agent: AgentAdapter;
  readonly backlog: Backlog;
  readonly planner?: AgentAdapter | false;
  readonly reviewer?: AgentAdapter | false;
  readonly merger?: AgentAdapter;
  readonly cycles?: number;
  readonly concurrency?: number;
  readonly implementationPasses?: number;
  readonly reviewPasses?: number;
  readonly standards?: string;
  readonly observe?: (event: CampaignEvent) => void;
}

export interface IssueOutcome {
  readonly id: string;
  readonly branch: string;
  readonly state: "empty" | "failed" | "merged";
  readonly error?: unknown;
}

export interface CampaignResult {
  readonly cycles: number;
  readonly reason: "empty" | "blocked" | "no-progress" | "limit";
  readonly issues: readonly IssueOutcome[];
}

export interface CompletedIssue extends Assignment {
  readonly head: string;
}
export interface CampaignContext {
  readonly options: CampaignOptions;
  readonly runtime: SandboxOptions & { readonly agent: AgentAdapter };
  readonly standards: string;
  readonly emit: (phase: CampaignEvent["phase"], issue?: string) => void;
}
