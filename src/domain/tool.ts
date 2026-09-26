import { invariant } from "./errors.ts";
import { TOOL_NAME_PATTERN } from "./model.constants.ts";
import {
  formatIssues,
  isStandardJsonSchema,
  standardInputSchema,
  validateStandard,
} from "./standard-schema.ts";
import { HARNESS_TOOL_FIELDS } from "./tool.constants.ts";
import { schemaIssues, validateSchemaDefinition } from "./tool-schema.ts";
import type {
  HarnessTool,
  HarnessToolContext,
  HarnessToolOptions,
  HarnessToolset,
  HarnessToolsetOptions,
  JsonSchema,
  StandardJsonSchema,
  ToolValidation,
} from "./tool.types.ts";

export function defineHarnessTool<Input>(
  options: HarnessToolOptions<Input>,
): HarnessTool<Input> {
  invariant(
    options !== null && typeof options === "object",
    "Tool options must be an object",
  );
  invariant(
    Object.keys(options).every((key) => HARNESS_TOOL_FIELDS.has(key)),
    "Unsupported tool option",
  );
  invariant(
    typeof options.name === "string" && TOOL_NAME_PATTERN.test(options.name),
    "Tool names use 1 to 64 letters, digits, underscores or hyphens",
  );
  invariant(
    typeof options.description === "string" && options.description.trim(),
    "Tool description must be nonempty text",
  );
  invariant(
    typeof options.execute === "function",
    "Tool execute must be a function",
  );
  invariant(
    options.readOnly === undefined || typeof options.readOnly === "boolean",
    "Tool readOnly must be boolean",
  );
  const standard = isStandardJsonSchema(options.input)
    ? (options.input as StandardJsonSchema<Input>)
    : undefined;
  if (!standard) validateSchemaDefinition(options.input);
  const inputSchema: JsonSchema = standard
    ? standardInputSchema(standard)
    : Object.freeze(structuredClone(options.input as JsonSchema));
  return Object.freeze({
    kind: "tool",
    name: options.name,
    description: options.description,
    readOnly: options.readOnly ?? false,
    inputSchema,
    async validate(value: unknown): Promise<ToolValidation<Input>> {
      if (standard) {
        const result = await validateStandard(standard, value);
        return "issues" in result
          ? { issues: formatIssues(result.issues) }
          : { value: result.value };
      }
      const issues = schemaIssues(inputSchema, value);
      return issues.length
        ? { issues: issues.join("; ") }
        : { value: value as Input };
    },
    execute: (value: Input, context: HarnessToolContext) =>
      options.execute(value, context),
  });
}

export function defineHarnessToolset(
  options: HarnessToolsetOptions,
): HarnessToolset {
  invariant(
    options !== null && typeof options === "object",
    "Toolset options must be an object",
  );
  invariant(
    typeof options.name === "string" && options.name.trim(),
    "Toolset name must be nonempty text",
  );
  return Object.freeze({
    kind: "toolset",
    name: options.name,
    tools: harnessTools(options.tools),
  });
}

export function harnessTools(
  entries: readonly (HarnessTool | HarnessToolset)[],
): readonly HarnessTool[] {
  invariant(Array.isArray(entries), "Tools must be an array");
  const tools = entries.flatMap((entry) => {
    invariant(
      entry?.kind === "tool" || entry?.kind === "toolset",
      "Declare tools with defineHarnessTool or defineHarnessToolset",
    );
    return entry.kind === "tool" ? [entry] : entry.tools;
  });
  const names = new Set<string>();
  for (const tool of tools) {
    invariant(!names.has(tool.name), `Duplicate tool name: ${tool.name}`);
    names.add(tool.name);
  }
  return Object.freeze(tools);
}
