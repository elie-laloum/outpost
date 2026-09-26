import type { AgentEvent } from "./agent.types.ts";
import type { AgentModel } from "./model.types.ts";
import type { ToolResources } from "./permissions.types.ts";
import type { StandardValidator } from "./response.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";

export type JsonSchema = Readonly<Record<string, unknown>>;

export interface StandardJsonSchema<Input> {
  readonly "~standard": StandardValidator<Input>["~standard"] & {
    readonly jsonSchema: {
      input(options: { readonly target: string }): Record<string, unknown>;
    };
  };
}

export type HarnessToolEvent = Extract<
  AgentEvent,
  { readonly kind: "text" | "warning" | "raw" }
>;

export interface HarnessToolContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly callId: string;
  readonly model: AgentModel;
  observe(event: HarnessToolEvent): void;
}

export type ToolOutput =
  string | { readonly content: string; readonly isError?: boolean };

export interface HarnessToolOptions<Input> {
  readonly name: string;
  readonly description: string;
  readonly input: StandardJsonSchema<Input> | JsonSchema;
  readonly readOnly?: boolean;
  resources?(input: Input): ToolResources;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}

export type ToolValidation<Input> =
  { readonly value: Input } | { readonly issues: string };

export interface HarnessTool<Input = unknown> {
  readonly kind: "tool";
  readonly name: string;
  readonly description: string;
  readonly readOnly: boolean;
  readonly inputSchema: JsonSchema;
  validate(value: unknown): Promise<ToolValidation<Input>>;
  resources(input: Input): ToolResources;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}

export interface HarnessToolsetOptions {
  readonly name: string;
  readonly tools: readonly (HarnessTool | HarnessToolset)[];
}

export interface HarnessToolset {
  readonly kind: "toolset";
  readonly name: string;
  readonly tools: readonly HarnessTool[];
}

export type SchemaKeywordCheck = (
  schema: JsonSchema,
  value: unknown,
  path: string,
) => readonly string[];
