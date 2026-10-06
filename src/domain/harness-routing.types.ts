import type {
  Decision,
  DecisionQuestions,
  DecisionProvider,
  DecisionState,
  ChoiceQuestion,
} from "./decision.types.ts";
import type {
  AgentModel,
  ModelMessage,
  ModelSpec,
  ModelToolSpec,
} from "./model.types.ts";

export interface HarnessModelRoutingContext {
  readonly system: string;
  readonly messages: readonly ModelMessage[];
  readonly tools: readonly ModelToolSpec[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
}

export type RoutingQuestion<Q extends DecisionQuestions> = {
  [Key in keyof Q]: Extract<Q[Key], ChoiceQuestion> extends never ? never : Key;
}[keyof Q];
export type RoutingChoices<
  Q extends DecisionQuestions,
  Key extends RoutingQuestion<Q>,
> = `${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string | number>}`;

export interface HarnessModelRoutingOptions<
  Q extends DecisionQuestions = DecisionQuestions,
  Key extends RoutingQuestion<Q> = RoutingQuestion<Q>,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly question: Key;
  readonly models: Readonly<Record<RoutingChoices<Q, Key>, ModelSpec>>;
  readonly minConfidence?: number;
  readonly fallback: RoutingChoices<Q, Key>;
  readonly onError?: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}

export interface HarnessModelRouting {
  readonly kind: "model-routing";
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision;
  readonly question: string;
  readonly models: Readonly<Record<string, AgentModel>>;
  readonly minConfidence: number;
  readonly fallback: string;
  readonly onError: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}

export interface ModelRouteEvent {
  readonly kind: "model-route";
  readonly step: number;
  readonly choice: string;
  readonly model: AgentModel;
  readonly reason: "selected" | "confidence" | "unavailable";
  readonly confidence?: number;
}
