import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { observationComponents } from "../src/application/recipes/observation.ts";
import {
  extensionSchema,
  reportSchema,
} from "../src/application/recipes/schemas.constants.ts";
import { recipeScalarSchemas } from "../src/domain/recipes/schema.constants.ts";

const configuration = JSON.parse(
  await readFile(
    new URL("../recipes/schemas/configuration-v1.json", import.meta.url),
    "utf8",
  ),
);
const recipe = JSON.parse(
  await readFile(
    new URL("../recipes/schemas/recipe-v1-v2.json", import.meta.url),
    "utf8",
  ),
);
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== "object") return value;
  if (typeof value.component === "string")
    return {
      anyOf: [
        recipeScalarSchemas.reference,
        { $ref: `#/$defs/${value.component}` },
      ],
    };
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["component", "hostPath", "secret"].includes(key))
      .map(([key, item]) => [key, clean(item)]),
  );
}
const definitions = {};
for (const component of observationComponents) {
  const shape = clean(component.schema);
  shape.properties.type = {
    const: component.name.slice(component.kind.length + 1),
  };
  if (component.kind !== "observation")
    shape.required = [...(shape.required ?? []), "type"];
  (definitions[component.kind] ??= { anyOf: [] }).anyOf.push(shape);
}
const current = structuredClone(configuration);
delete current.$schema;
delete current.title;
current.properties.version = { const: 2 };
current.properties.observation = {
  anyOf: [recipeScalarSchemas.reference, { $ref: "#/$defs/observation" }],
};
current.properties.reports = { type: "array", items: reportSchema };
current.properties.extensions = {
  type: "object",
  additionalProperties: extensionSchema,
};
current.properties.experimental = { type: "boolean" };
for (const [family, kind] of [
  ["observations", "observation"],
  ["sinks", "sink"],
])
  current.properties[family] = {
    type: "object",
    additionalProperties: {
      anyOf: [recipeScalarSchemas.reference, { $ref: `#/$defs/${kind}` }],
    },
  };
const old = structuredClone(configuration);
delete old.$schema;
delete old.title;
const configSchema = {
  $schema: configuration.$schema,
  title: configuration.title,
  $defs: definitions,
  oneOf: [old, current],
};
const version2 = structuredClone(
  recipe.oneOf.find((shape) => shape.properties.version.const === 2),
);
version2.properties.version = { const: 3 };
recipe.oneOf.push(version2);
for (const [file, value] of [
  ["recipe-configuration.schema.json", configSchema],
  ["recipe.schema.json", recipe],
]) {
  const path = new URL(`../${file}`, import.meta.url);
  if (process.argv.includes("--write"))
    await writeFile(path, JSON.stringify(value, null, 2) + "\n");
  else
    assert.deepEqual(
      JSON.parse(await readFile(path, "utf8")),
      value,
      `Stale generated schema: ${file}`,
    );
}
console.log("Recipe editor schemas match their component descriptors.");
