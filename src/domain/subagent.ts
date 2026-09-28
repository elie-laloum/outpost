import { agent } from "./agent.ts";
import { invariant, OutpostError } from "./errors.ts";
import { SUBAGENT_FIELDS, SUBAGENT_INPUT } from "./subagent.constants.ts";
import type {
  HarnessSubagent,
  HarnessSubagentInput,
  HarnessSubagentOptions,
} from "./subagent.types.ts";
import { defineHarnessTool } from "./tool.ts";
import type { HarnessTool } from "./tool.types.ts";

export function defineHarnessSubagent(
  options: HarnessSubagentOptions,
): HarnessSubagent {
  invariant(
    options !== null && typeof options === "object",
    "Subagent options must be an object",
  );
  invariant(
    Object.keys(options).every((key) => SUBAGENT_FIELDS.has(key)),
    "Unsupported subagent option",
  );
  invariant(
    options.agent?.kind === "custom",
    "Subagents require a built-in harness agent",
  );
  const child = agent({
    harness: options.agent.harness,
    model: options.agent.model,
  });
  return Object.freeze({
    ...defineHarnessTool<HarnessSubagentInput>({
      name: options.name,
      description: options.description,
      input: SUBAGENT_INPUT,
      execute() {
        throw new OutpostError(
          "configuration",
          "Subagents must be invoked by the harness runtime",
        );
      },
    }),
    subagent: child,
  });
}

export function isHarnessSubagent(tool: HarnessTool): tool is HarnessSubagent {
  return "subagent" in tool;
}
