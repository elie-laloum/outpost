import type { ModelProvider, ModelResult } from "./model.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";
import type { Command, Variables } from "./command.types.ts";
import type { ConversationStore } from "./conversation.types.ts";

export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}

export type AgentEvent =
  | {
      readonly kind: "phase";
      readonly name: string;
      readonly agent?: string;
      readonly branch?: string;
      readonly directory?: string;
    }
  | {
      readonly kind: "summary";
      readonly durationMs: number;
      readonly status: number;
      readonly tokens: Usage;
    }
  | { readonly kind: "warning"; readonly message: string }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "result"; readonly text: string }
  | { readonly kind: "prompt"; readonly text: string }
  | { readonly kind: "tool"; readonly name: string; readonly input: unknown }
  | { readonly kind: "conversation"; readonly id: string }
  | { readonly kind: "usage"; readonly tokens: Usage }
  | { readonly kind: "failure"; readonly message: string }
  | { readonly kind: "finished" }
  | { readonly kind: "raw"; readonly value: unknown };

export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
};

export type AgentEventHandlers = {
  readonly [Kind in AgentEvent["kind"]]?: (
    event: Extract<AgentEvent, { kind: Kind }>,
  ) => void;
};

export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
}

export interface AgentFeatures {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
}

export interface AgentAdapter extends AgentFeatures {
  authenticate?(
    variables: Readonly<Record<string, string>>,
  ): Command | undefined;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}

export interface RequiredAgent {
  readonly agent: Agent;
}

export interface CliHarness {
  readonly kind: "cli";
  bind(model?: string): AgentAdapter;
}

export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly run: HarnessRun;
}

export type Harness = CliHarness | CustomHarness;

export interface HarnessInput {
  readonly prompt: string;
}

export interface HarnessContext {
  readonly model: string;
  readonly modelProvider: ModelProvider;
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  observe(event: AgentEvent): void;
}

export type HarnessRun = (
  input: HarnessInput,
  context: HarnessContext,
) => Promise<ModelResult>;

export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly run: HarnessRun;
}

export interface CliAgent extends AgentAdapter {
  readonly kind: "cli";
  readonly harness: CliHarness;
  readonly model?: string;
}

export interface CustomAgent extends AgentFeatures {
  readonly resumable: false;
  readonly capture: false;
  readonly kind: "custom";
  readonly harness: CustomHarness;
  readonly model: string;
}

export type Agent = CliAgent | CustomAgent;

export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: string;
}
export interface CustomAgentOptions {
  readonly harness: CustomHarness;
  readonly model: string;
}
export type AgentOptions = CliAgentOptions | CustomAgentOptions;

export type AgentAuthentication =
  | { readonly mode: "api-key"; readonly environment?: string }
  | { readonly mode: "oauth-token" }
  | { readonly mode: "login"; readonly credentials?: string };
