import {
  configurationError,
  configurationPath,
} from "../../domain/configuration-diagnostic.ts";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { JsonSchema } from "../../domain/tool.types.ts";

const validator = new Ajv2020({
  allErrors: true,
  strict: true,
  strictTuples: false,
  ownProperties: true,
  validateFormats: false,
});
validator.addKeyword({
  keyword: "component",
  schemaType: "string",
  valid: true,
});
validator.addKeyword({
  keyword: "hostPath",
  schemaType: "boolean",
  valid: true,
});
validator.addKeyword({ keyword: "secret", schemaType: "boolean", valid: true });
validator.addKeyword({ keyword: "regexp", schemaType: "boolean", valid: true });
validator.addKeyword({
  keyword: "contract",
  schemaType: "string",
  valid: true,
});

export function validateRecipeSchema<T>(
  schema: JsonSchema,
  value: unknown,
  label: string,
): T {
  const check = validator.compile<T>(schema);
  if (!check(value))
    throw configurationError(
      `${label}: ${validator.errorsText(check.errors, { separator: "; " })}`,
      [
        ...configurationPath(label),
        ...(check.errors?.[0]?.instancePath
          .split("/")
          .slice(1)
          .map((key) => key.replaceAll("~1", "/").replaceAll("~0", "~")) ?? []),
      ],
      "invalid-schema",
    );
  return value;
}

export function recipeJsonValidator(
  schema: JsonSchema,
): (value: unknown) => unknown {
  const check = validator.compile(schema);
  return (value) => {
    if (!check(value))
      throw new Error(
        `Invalid JSON response: ${validator.errorsText(check.errors)}`,
      );
    return value;
  };
}
