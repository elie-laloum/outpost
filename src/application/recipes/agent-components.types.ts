import type { Agent } from "../../domain/agent.types.ts";
import type { FallbackAgentOptions } from "../../domain/fallback-agent.types.ts";
import type { HarnessInstructionSource } from "../../domain/harness.types.ts";
import type { ConversationStore } from "../../domain/conversation.types.ts";
import type { TransportConversationOptions } from "../../infrastructure/transport-conversations.types.ts";
import type { JsonSchema } from "../../domain/tool.types.ts";
import type { StandardValidator } from "../../domain/response.types.ts";
import type { DispatchOptions } from "../execution.types.ts";
import type { HarnessModelRoutingOptions } from "../../domain/harness-routing.types.ts";
import type { ModelSpec } from "../../domain/model.types.ts";

export type RecipeEmptyOptions = Readonly<Record<string, never>>;
export type RecipeDispatchSettings = Omit<
  DispatchOptions<unknown>,
  "brief" | "agent" | "observation"
>;
export interface RecipeRoutingOptions extends Omit<
  HarnessModelRoutingOptions,
  "question" | "models" | "fallback"
> {
  readonly question: string;
  readonly models: Readonly<Record<string, ModelSpec>>;
  readonly fallback: string;
}
export interface RecipeFallbackOptions extends FallbackAgentOptions {
  readonly agents: readonly [Agent, Agent, ...Agent[]];
}
export interface RecipeInstructionsOptions {
  readonly source: HarnessInstructionSource;
}
export interface RecipeTransportConversationsOptions extends TransportConversationOptions {
  readonly base: ConversationStore;
}
export interface RecipeJsonResponseOptions {
  readonly tag: string;
  readonly repairs?: number;
  readonly jsonSchema: JsonSchema;
  readonly schema?: StandardValidator<unknown> | ((input: unknown) => unknown);
}
