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

export interface AgentAdapter {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}

export interface RequiredAgent {
  readonly agent: AgentAdapter;
}
