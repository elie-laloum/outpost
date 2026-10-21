import type { Agent } from "../domain/agent.types.ts";
import type { Variables } from "../domain/command.types.ts";
import type { ConversationContext } from "../domain/conversation.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { SandboxLease, SandboxProvider } from "../domain/sandbox.types.ts";

/** `warm` authenticates and configures each CLI adapter once per lease; `per-dispatch` repeats both. */
export type AgentAuthenticationPolicy = "warm" | "per-dispatch";

export interface AgentSessionEnvironment {
  readonly lease: SandboxLease;
  readonly placement: SandboxProvider["placement"];
  readonly authentication: AgentAuthenticationPolicy;
  /** Conversation paths shared by restoration and capture; dispatches add their own observation. */
  readonly conversation: Omit<
    ConversationContext,
    "sandbox" | "observation" | "warn"
  >;
  /** Variables visible to the agent; the caller decides whether any environment file is read. */
  variables(agent: Agent): Variables | Promise<Variables>;
  /** Replaces an agent with its prepared adapter, such as a remote CLI bootstrap. */
  adapter?(
    agent: Agent,
    signal: AbortSignal,
    observation?: ObservationHub,
  ): Promise<Agent>;
}

export interface AuthenticatedAgent {
  readonly adapter: Agent;
  readonly variables: Variables;
}

export interface PreparedAgentSession {
  readonly selected: Agent;
  readonly adapter: Agent;
  readonly executionLease: SandboxLease;
}

export interface AgentSessions {
  prepare(
    agent: Agent,
    signal: AbortSignal,
    observation?: ObservationHub,
  ): Promise<PreparedAgentSession>;
  restore(
    id: string,
    agent: Agent,
    executionLease: SandboxLease,
  ): Promise<void>;
  remember(agent: Agent, id: string): void;
  conversationContext(executionLease: SandboxLease): ConversationContext;
}
