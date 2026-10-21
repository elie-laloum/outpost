import { fromSecrets } from "../secrets.ts";
import { recipeSchema } from "../../domain/recipes/values.ts";
import { recipeScalarSchemas as schemas } from "../../domain/recipes/schema.constants.ts";
import { createJsonDecoder } from "../../infrastructure/json-schema.ts";
import { nativeRecipeGuards } from "./native.ts";
import type { RecipeComponentDefinition } from "../../domain/recipes/component.types.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import type { RecipeSecretSelection } from "./variables.types.ts";

function isSecretSource(value: unknown): value is SecretSource {
  return nativeRecipeGuards.secretSource!(value);
}

const secretSelection = createJsonDecoder<RecipeSecretSelection>(
  recipeSchema(
    {
      source: { ...schemas.reference, component: "secretSource" },
      names: schemas.strings,
      timeoutMs: schemas.integer,
    },
    ["source", "names"],
  ),
  "secret selection",
);

export const secretSelectionComponent: RecipeComponentDefinition = {
  name: "variables.secrets",
  kind: "variables",
  schema: secretSelection.schema,
  accepts: nativeRecipeGuards.variables!,
  async create(value, context) {
    const options = secretSelection.parse(value);
    const source = await context.resolve(options.source.$ref, "secretSource");
    if (!isSecretSource(source)) throw new Error("Invalid secret source");
    return fromSecrets(source, options.names, {
      signal: context.signal,
      ...(options.timeoutMs === undefined
        ? {}
        : { timeoutMs: options.timeoutMs }),
    });
  },
};
