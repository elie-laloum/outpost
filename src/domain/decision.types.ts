import type { Usage } from "./agent.types.ts";
import type { ObservationHub } from "./observation.types.ts";
import type { WorkflowJson } from "./workflow/checkpoint.types.ts";

export type DecisionState =
  string | readonly WorkflowJson[] | { readonly [key: string]: WorkflowJson };

export interface ChoiceQuestion {
  readonly type: "choice";
  readonly instructions: string;
  readonly criteria: Readonly<Record<string, string>>;
}

export interface ScoreQuestion {
  readonly type: "score";
  readonly instructions: string;
  readonly criteria: readonly string[];
}

export interface NoulQuestion {
  readonly type: "noul";
  readonly instructions: string;
  readonly criteria?: { readonly true: string; readonly false: string };
}

export type DecisionQuestion = ChoiceQuestion | ScoreQuestion | NoulQuestion;
export type DecisionQuestions = Readonly<Record<string, DecisionQuestion>>;

export interface DecisionOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly questions: Q;
}

export interface Decision<Q extends DecisionQuestions = DecisionQuestions> {
  readonly kind: "decision";
  readonly questions: Q;
}

export interface ChoiceAnswer<Choice extends string = string> {
  readonly type: "choice";
  readonly choice: Choice;
  readonly probabilities: Readonly<Record<Choice, number>>;
  readonly confidence: number;
}

export interface ScoreAnswer {
  readonly type: "score";
  readonly score: number;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly confidence: number;
  readonly legend?: Readonly<Record<string, string>>;
}

export interface NoulAnswer {
  readonly type: "noul";
  readonly noul: number;
}

export type DecisionAnswer<Q extends DecisionQuestion> =
  Q extends ChoiceQuestion
    ? ChoiceAnswer<`${Extract<keyof Q["criteria"], string | number>}`>
    : Q extends ScoreQuestion
      ? ScoreAnswer
      : NoulAnswer;

export type DecisionAnswers<Q extends DecisionQuestions> = {
  readonly [Key in keyof Q]: DecisionAnswer<Q[Key]>;
};

export interface DecisionProviderResult {
  readonly model: string;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}

export interface DecisionRequest {
  readonly model: string;
  readonly questions: DecisionQuestions;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
}

export interface DecisionProvider {
  readonly name: string;
  readonly identity?: string;
  request(request: DecisionRequest): Promise<DecisionProviderResult>;
}

export interface DecisionResult<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: string;
  readonly model: string;
  readonly answers: DecisionAnswers<Q>;
  readonly usage: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}

export interface DecideOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
  readonly observation?: ObservationHub;
  readonly allowTruncated?: boolean;
}

export interface DecisionEvent {
  readonly kind: "decision";
  readonly status: "started" | "finished" | "failed";
  readonly provider: string;
  readonly model: string;
  readonly durationMs?: number;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly code?: string;
}
