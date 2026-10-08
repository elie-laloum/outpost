import { recipeSchema } from "../../domain/recipes/values.ts";
import { recipeScalarSchemas as schema } from "../../domain/recipes/schema.constants.ts";

export const extensionSchema = recipeSchema(
  {
    module: schema.text,
    export: schema.text,
    kind: schema.text,
    version: schema.text,
    factory: schema.boolean,
    schema: schema.object,
    options: schema.object,
    dispose: schema.text,
  },
  ["module", "export", "kind", "version"],
);

export const reportSchema = recipeSchema(
  { type: { enum: ["json", "text"] }, stream: { enum: ["stdout", "stderr"] } },
  ["type"],
);
