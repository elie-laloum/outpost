import { invariant } from "./errors.ts";
import { STANDARD_JSON_SCHEMA_TARGET } from "./tool.constants.ts";
import type {
  StandardIssue,
  StandardPathSegment,
  StandardResult,
  StandardValidator,
} from "./response.types.ts";
import type { JsonSchema, StandardJsonSchema } from "./tool.types.ts";

export async function validateStandard<T>(
  schema: StandardValidator<T>,
  value: unknown,
): Promise<StandardResult<T>> {
  const result = await schema["~standard"].validate(value);
  if (result.issues) return { issues: result.issues };
  return { value: result.value };
}

export function isStandardJsonSchema(
  value: unknown,
): value is StandardJsonSchema<unknown> {
  if (value === null || typeof value !== "object" || !("~standard" in value))
    return false;
  const standard = value["~standard"] as Record<string, unknown> | undefined;
  return (
    typeof standard?.validate === "function" &&
    typeof (standard.jsonSchema as Record<string, unknown> | undefined)
      ?.input === "function"
  );
}

export function standardInputSchema(
  schema: StandardJsonSchema<unknown>,
): JsonSchema {
  const converted = schema["~standard"].jsonSchema.input({
    target: STANDARD_JSON_SCHEMA_TARGET,
  });
  invariant(
    converted !== null &&
      typeof converted === "object" &&
      !Array.isArray(converted) &&
      converted.type === "object",
    "Standard schema must convert to a JSON Schema object",
  );
  const { $schema: _dialect, ...portable } = converted;
  return Object.freeze(portable);
}

export function formatIssues(issues: readonly unknown[]): string {
  return issues
    .map((issue) => {
      if (issue === null || typeof issue !== "object") return String(issue);
      const { message, path } = issue as StandardIssue;
      const location = Array.isArray(path)
        ? path
            .map((segment) =>
              segment !== null && typeof segment === "object"
                ? String((segment as StandardPathSegment).key)
                : String(segment),
            )
            .join(".")
        : "";
      return `${location ? `${location}: ` : ""}${String(message ?? JSON.stringify(issue))}`;
    })
    .join("; ");
}
