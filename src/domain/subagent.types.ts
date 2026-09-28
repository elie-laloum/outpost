import type { CustomAgent } from "./agent.types.ts";
import type { HarnessTool } from "./tool.types.ts";

export interface HarnessSubagentInput {
  readonly prompt: string;
}

export interface HarnessSubagentOptions {
  readonly name: string;
  readonly description: string;
  readonly agent: CustomAgent;
}

export interface HarnessSubagent extends HarnessTool<HarnessSubagentInput> {
  readonly subagent: CustomAgent;
}
