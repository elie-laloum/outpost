import type { Usage } from "./agent.types.ts";
import type { HarnessContextStrategy } from "./context.types.ts";
import type { ConversationStore } from "./conversation.types.ts";
import type { HarnessHook } from "./hook.types.ts";
import type { AgentModel, ModelProvider } from "./model.types.ts";
import type { HarnessPermissions } from "./permissions.types.ts";
import type { HarnessSkill } from "./skill.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";
import type { HarnessTool, HarnessToolset } from "./tool.types.ts";

export interface HarnessInstructionContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
}

export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);

export interface HarnessInstructions {
  readonly kind: "instructions";
  resolve(context: HarnessInstructionContext): Promise<string>;
}

export type HarnessInstructionsOption =
  string | HarnessInstructions | readonly (string | HarnessInstructions)[];

export interface HarnessLimits {
  readonly maxSteps?: number;
  readonly maxToolCalls?: number;
  readonly usage?: Partial<Usage>;
}

export interface ResolvedHarnessLimits extends HarnessLimits {
  readonly maxSteps: number;
}

export interface HarnessToolExecution {
  readonly concurrency?: number;
  readonly deadlineMs?: number;
  readonly onError?: "return-to-model" | "fail";
}

export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly hooks?: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills?: readonly HarnessSkill[];
  readonly cache?: boolean;
}

export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly instructions: readonly HarnessInstructions[];
  readonly tools: readonly HarnessTool[];
  readonly limits: ResolvedHarnessLimits;
  readonly toolExecution: Required<HarnessToolExecution>;
  readonly hooks: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills: readonly HarnessSkill[];
  readonly cache: boolean;
}
