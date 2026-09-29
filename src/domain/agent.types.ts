import type { Harness } from "./harness.types.ts";
import type { AgentModel, ModelSpec } from "./model.types.ts";
import type { Command, CommandResult, Variables } from "./command.types.ts";
import type { ConversationStore } from "./conversation.types.ts";
import type { ReplayAgent } from "./replay.types.ts";
import type { SteeringMode } from "./steering.types.ts";
import type {
  FallbackCandidate,
  FallbackTrigger,
} from "./fallback-agent.types.ts";

export interface Usage {
  readonly complete?: boolean;
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}

export type AgentEvent = AgentEventDetails & {
  readonly subagentId?: string;
};

export type AgentEventDetails =
  | {
      readonly kind: "subagent";
      readonly id: string;
      readonly callId: string;
      readonly name: string;
      readonly status: "started" | "finished" | "failed";
      readonly conversation?: string;
    }
  | {
      readonly kind: "message-usage";
      readonly tokens: Usage;
      readonly messageId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "stderr";
      readonly text: string;
      readonly truncated?: boolean;
    }
  | {
      readonly kind: "stopped";
      readonly reason:
        | "completion"
        | "idle-timeout"
        | "deadline"
        | "aborted"
        | "oversized-event"
        | "steered";
    }
  | {
      readonly kind: "steer";
      readonly text: string;
      readonly mode: SteeringMode;
    }
  | {
      readonly kind: "reasoning";
      readonly text: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "file-change";
      readonly changes: unknown;
      readonly callId?: string;
    }
  | { readonly kind: "model-request"; readonly request: unknown }
  | { readonly kind: "model-response"; readonly response: unknown }
  | {
      readonly kind: "model-retry";
      readonly attempt: number;
      readonly message?: string;
    }
  | { readonly kind: "model-error"; readonly message: string }
  | { readonly kind: "hook"; readonly phase: string; readonly changed: boolean }
  | { readonly kind: "instructions-loaded"; readonly count: number }
  | { readonly kind: "skills-loaded"; readonly names: readonly string[] }
  | {
      readonly kind: "tool-output";
      readonly callId: string;
      readonly channel: "stdout" | "stderr";
      readonly text: string;
    }
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
  | { readonly kind: "text-delta"; readonly text: string }
  | { readonly kind: "result"; readonly text: string }
  | { readonly kind: "prompt"; readonly text: string }
  | {
      readonly kind: "tool";
      readonly name: string;
      readonly input: unknown;
      readonly callId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "tool-result";
      readonly callId: string;
      readonly name: string;
      readonly isError: boolean;
      readonly preview: string;
      readonly characters: number;
      readonly parentCallId?: string;
    }
  | { readonly kind: "step"; readonly index: number }
  | {
      readonly kind: "tool-denied";
      readonly callId: string;
      readonly name: string;
      readonly reason: string;
    }
  | { readonly kind: "stop-prevented"; readonly message: string }
  | {
      readonly kind: "compaction";
      readonly strategy: string;
      readonly messages: number;
    }
  | { readonly kind: "conversation"; readonly id: string }
  | {
      readonly kind: "usage";
      readonly tokens: Usage;
      readonly cumulative?: boolean;
    }
  | { readonly kind: "failure"; readonly message: string }
  | {
      readonly kind: "quota";
      readonly message: string;
      readonly resetAt?: string;
    }
  | {
      readonly kind: "fallback";
      readonly from: FallbackCandidate;
      readonly to: FallbackCandidate;
      readonly failure: FallbackTrigger;
      readonly message: string;
      readonly resetAt?: string;
    }
  | { readonly kind: "finished" }
  | {
      readonly kind: "raw";
      readonly value: unknown;
      readonly bytes?: number;
      readonly truncated?: boolean;
    };

export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
  readonly seq?: number;
  readonly source?: import("./observation.types.ts").ObservationSource;
  readonly scope?: import("./observation.types.ts").ObservationScope;
};

export type AgentEventHandlers = {
  readonly [Kind in AgentEvent["kind"]]?: (
    event: Extract<AgentEvent, { kind: Kind }>,
  ) => void;
};

export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  /** Requests the liveInput protocol: stdin carries the encoded prompt and stays open. */
  readonly liveInput?: boolean;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
}

export interface AgentFeatures {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly usage?: "events" | "session" | "unavailable";
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex" | "copilot" | "kimi";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  readonly forkable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
}

export interface AgentAdapter extends AgentFeatures {
  fork?(
    id: string,
    invoke: (command: Command) => Promise<CommandResult>,
  ): Promise<string>;
  credentials?(variables: Variables): CredentialPlan;
  /** Plans CLI configuration merged into the agent home; throws when a referenced variable is missing. */
  configuration?(variables: Variables): AgentConfiguration;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
  /** Recognizes a usage-limit or rate-limit message in failure or stderr text. */
  quota?(text: string): boolean;
  /** Recognizes a terminal service outage or connection failure in failure or stderr text. */
  unavailable?(text: string): boolean;
  usageCommand?(conversation: string): Command | undefined;
  usageResult?(text: string): Usage | undefined;
  /** Protocol for adding user messages to a running turn through live stdin. */
  readonly liveInput?: AgentLiveInput;
}

export interface AgentLiveInput {
  /** Starts the protocol state of one turn requested with input. */
  open(input: AgentInput): AgentLiveSession;
}

export interface AgentLiveSession {
  /** Encodes one user message for stdin, or returns "" when the session sends it later. */
  encode(text: string): string;
  /** Reads one output line: user messages it confirms and protocol replies to write. */
  read(line: string): AgentLiveRead;
}

export interface AgentLiveRead {
  readonly consumed: number;
  readonly replies: readonly string[];
}

export interface RequiredAgent {
  readonly agent: Agent;
}

export interface CliHarness {
  readonly kind: "cli";
  bind(model?: AgentModel): AgentAdapter;
}

export type AgentHarness = CliHarness | Harness;

export interface CliAgent extends AgentAdapter {
  readonly kind: "cli";
  readonly harness: CliHarness;
  readonly model?: AgentModel;
}

export interface CustomAgent extends AgentFeatures {
  readonly resumable: boolean;
  readonly capture: boolean;
  readonly kind: "custom";
  readonly harness: Harness;
  readonly model: AgentModel;
}

export type Agent = CliAgent | CustomAgent | ReplayAgent;

export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: ModelSpec;
}
export interface CustomAgentOptions {
  readonly harness: Harness;
  readonly model: ModelSpec;
}
export type AgentOptions = CliAgentOptions | CustomAgentOptions;

export type AccountCredential =
  | { readonly file: string }
  | { readonly key: string }
  | { readonly variable: string };

export type UsageCredential =
  { readonly key: string } | { readonly variable: string };

export type AgentAuthentication =
  | "account"
  | "usage"
  | { readonly account: AccountCredential }
  | { readonly usage: UsageCredential };

export interface HostCredentialPath {
  readonly path: string;
  readonly home?: { readonly variable: string; readonly path: string };
}

export interface HostCredential {
  readonly source: HostCredentialPath;
  readonly destination:
    { readonly file: string } | { readonly variable: string };
  readonly login: string;
  readonly alternative?: string;
  select?(content: string): string;
}

export interface GeneratedCredential {
  readonly path: string;
  readonly content: string;
}

export interface ConfigurationFile {
  readonly path: string;
  readonly section?: string;
  readonly entries: Readonly<Record<string, unknown>>;
}

export interface HostConfiguration {
  readonly source: HostCredentialPath;
  readonly path: string;
  readonly section?: string;
  readonly optional?: boolean;
  readonly login: string;
  select(content: string): Readonly<Record<string, unknown>>;
}

export interface AgentConfiguration {
  readonly files: readonly ConfigurationFile[];
  readonly host?: readonly HostConfiguration[];
}

export interface CredentialPlan {
  readonly variables: Variables;
  readonly host: readonly HostCredential[];
  readonly files: readonly GeneratedCredential[];
  readonly commands: readonly Command[];
}
