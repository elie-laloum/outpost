import { Ajv2020 } from "ajv/dist/2020.js";
import type { JsonSchema } from "../../domain/tool.types.ts";

const validator = new Ajv2020({
  allErrors: true,
  strict: true,
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

export function validateRecipeSchema<T>(
  schema: JsonSchema,
  value: unknown,
  label: string,
): T {
  const check = validator.compile<T>(schema);
  if (!check(value))
    throw new Error(
      `${label}: ${validator.errorsText(check.errors, { separator: "; " })}`,
    );
  return value;
}
