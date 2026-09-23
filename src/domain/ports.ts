export type Variables = Readonly<Record<string, string>>;
export type Channel = "stdout" | "stderr";

export interface Command {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly stdin?: string;
  readonly directory?: string;
  readonly variables?: Variables;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
  readonly interactive?: boolean;
  readonly elevated?: boolean;
  readonly retain?: number;
  readonly observe?: (channel: Channel, text: string) => void;
}

export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}

export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}

export interface SandboxLease {
  readonly root: string;
  readonly home: string;
  invoke(command: Command): Promise<CommandResult>;
  upload(source: string, destination: string): Promise<void>;
  download(source: string, destination: string): Promise<void>;
  release(): Promise<void>;
}

export interface SandboxProvider {
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}

export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly output: number;
}

export type AgentEvent =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "prompt"; readonly text: string }
  | { readonly kind: "tool"; readonly name: string; readonly input: unknown }
  | { readonly kind: "conversation"; readonly id: string }
  | { readonly kind: "usage"; readonly tokens: Usage }
  | { readonly kind: "failure"; readonly message: string }
  | { readonly kind: "finished" }
  | { readonly kind: "raw"; readonly value: unknown };

export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
}

export interface AgentAdapter {
  readonly name: string;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly capture?: boolean;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}

export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}

export type BranchPolicy =
  | { readonly mode: "current" }
  | { readonly mode: "named"; readonly name: string; readonly from?: string }
  | { readonly mode: "integrate"; readonly from?: string };

export interface WorkspaceRecord {
  readonly repository: string;
  readonly directory: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly baseline: string;
  readonly gitDirectories: readonly string[];
  readonly policy: BranchPolicy;
}

export interface Commit {
  readonly oid: string;
  readonly subject: string;
}

export interface Disposal {
  readonly retainedDirectory?: string;
}

export interface LifecycleHooks {
  readonly workspaceReady?: readonly Command[];
  readonly hostReady?: readonly Command[];
  readonly sandboxReady?: readonly Command[];
}
