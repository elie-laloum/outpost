import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { observationComponents } from "../src/application/recipes/observation.ts";
import { nativeRecipeComponents } from "../src/application/recipes/native.ts";
import { nativeRecipeSchemas } from "../src/application/recipes/native-schemas.constants.ts";
import { secretSelectionComponent } from "../src/application/recipes/variables.ts";
import {
  extensionSchema,
  reportSchema,
} from "../src/application/recipes/schemas.constants.ts";
import {
  recipeScalarSchemas,
  recipeFamilies,
} from "../src/domain/recipes/schema.constants.ts";

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
const components = [
  ...observationComponents,
  ...nativeRecipeComponents,
  secretSelectionComponent,
];
const kinds = new Set(components.map((component) => component.kind));
function clean(value, prefix = "") {
  if (Array.isArray(value)) return value.map((item) => clean(item, prefix));
  if (!value || typeof value !== "object") return value;
  if (typeof value.component === "string")
    return {
      anyOf: [
        recipeScalarSchemas.reference,
        ...(kinds.has(value.component)
          ? [{ $ref: `#/$defs/${value.component}` }]
          : []),
      ],
    };
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !["component", "hostPath", "secret", "regexp", "$defs"].includes(key),
      )
      .map(([key, item]) => [
        key,
        key === "$ref" &&
        typeof item === "string" &&
        item.startsWith("#/$defs/")
          ? `#/$defs/${prefix}${item.slice(8)}`
          : clean(item, prefix),
      ]),
  );
}
const definitions = {};
function shapeOf(schema, name) {
  for (const [key, value] of Object.entries(schema.$defs ?? {}))
    definitions[`${name}.${key}`] = clean(value, `${name}.`);
  return clean(schema, `${name}.`);
}
function tagged(schema, type, field = "type", required = true) {
  if (schema.anyOf)
    return {
      anyOf: schema.anyOf.map((shape) => tagged(shape, type, field, required)),
    };
  return {
    ...schema,
    properties: { ...schema.properties, [field]: { const: type } },
    required: [...(schema.required ?? []), ...(required ? [field] : [])],
  };
}
for (const component of components) {
  const shape = tagged(
    shapeOf(component.schema, component.name),
    component.name.slice(component.kind.length + 1),
    "type",
    !["observation", "agent"].includes(component.kind),
  );
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
for (const [family, kind] of Object.entries(recipeFamilies))
  current.properties[family] = {
    type: "object",
    additionalProperties: {
      anyOf: [
        recipeScalarSchemas.reference,
        ...(kinds.has(kind) ? [{ $ref: `#/$defs/${kind}` }] : []),
      ],
    },
  };
const workspace = shapeOf(
  nativeRecipeSchemas["sandbox.options"],
  "sandbox.options",
);
for (const key of ["repository", "branch", "sandboxProvider", "observation"])
  delete workspace.properties[key];
current.properties.workspace = workspace;
current.properties.sandbox = {
  anyOf: [
    recipeScalarSchemas.reference,
    { $ref: "#/$defs/sandboxProvider" },
    ...components
      .filter((c) => c.kind === "sandboxProvider")
      .map((c) =>
        tagged(
          shapeOf(c.schema, c.name),
          c.name.slice(c.kind.length + 1),
          "provider",
        ),
      ),
  ],
};
const model = shapeOf(nativeRecipeSchemas["agent.composed"], "agent.composed")
  .anyOf[0].properties.model;
for (const component of components.filter((c) => c.kind === "harness")) {
  const shape = tagged(
    shapeOf(component.schema, component.name),
    component.name.slice(component.kind.length + 1),
    "harness",
  );
  shape.properties.model = model;
  definitions.agent.anyOf.push(shape);
}
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
