import type {
  HarnessInstructions,
  HarnessInstructionSource,
} from "./harness.types.ts";
import type { HarnessTool, HarnessToolset } from "./tool.types.ts";

export interface HarnessSkillOptions {
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructionSource;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
}

export interface HarnessSkill {
  readonly kind: "skill";
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructions;
  readonly tools: readonly HarnessTool[];
}

export interface SkillLoaderInput {
  readonly name: string;
}
