import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { workflowOptionComponents } from "../src/application/recipes/workflow-components.ts";
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
  ...workflowOptionComponents,
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
          ![
            "component",
            "hostPath",
            "secret",
            "regexp",
            "contract",
            "$defs",
          ].includes(key),
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
    !["observation", "agent"].includes(component.kind) &&
      !component.kind.endsWith("Options"),
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
current.properties.integration = shapeOf(
  nativeRecipeSchemas["integration.options"],
  "integration.options",
);
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
const version3 = structuredClone(
  recipe.oneOf.find((shape) => shape.properties.version.const === 2),
);
version3.properties.version = { const: 3 };
const taskV3 = structuredClone(recipe.$defs.task);
const expressions = {
  expression: {
    anyOf: [
      { type: ["null", "boolean", "number", "string"] },
      { type: "array", items: { $ref: "#/$defs/expression" } },
      ...["$input", "$step"].map((key) => ({
        type: "object",
        additionalProperties: false,
        required: [key],
        properties: {
          [key]: recipeScalarSchemas.text,
          path: { $ref: "#/$defs/propertyPath" },
        },
      })),
      {
        type: "object",
        additionalProperties: false,
        required: ["$literal"],
        properties: { $literal: {} },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["$select"],
        properties: {
          $select: {
            type: "object",
            additionalProperties: false,
            required: ["from", "path"],
            properties: {
              from: { $ref: "#/$defs/expression" },
              path: { $ref: "#/$defs/propertyPath" },
            },
          },
        },
      },
      {
        type: "object",
        additionalProperties: { $ref: "#/$defs/expression" },
        not: {
          anyOf: ["$input", "$step", "$literal", "$select"].map((key) => ({
            required: [key],
          })),
        },
      },
    ],
  },
  propertyPath: {
    type: "array",
    items: { anyOf: [{ type: "string" }, { type: "integer", minimum: 0 }] },
  },
  condition: {
    anyOf: [
      { type: "boolean" },
      ...[
        "all",
        "any",
        "not",
        "exists",
        "eq",
        "ne",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
      ].map((key) => ({
        type: "object",
        additionalProperties: false,
        required: [key],
        properties: {
          [key]: ["all", "any"].includes(key)
            ? { type: "array", items: { $ref: "#/$defs/condition" } }
            : key === "not"
              ? { $ref: "#/$defs/condition" }
              : key === "exists"
                ? { $ref: "#/$defs/expression" }
                : {
                    type: "array",
                    minItems: 2,
                    maxItems: 2,
                    items: { $ref: "#/$defs/expression" },
                  },
        },
      })),
    ],
  },
};
for (const [field, kind] of Object.entries({
  speculation: "speculation",
  queued: "queued",
  gate: "gate",
  interactive: "interactive",
  artifact: "artifactTask",
  dispatch: "dispatch",
  options: "task",
  loop: "loop",
  decision: "decisionTask",
  isolated: "isolated",
}))
  taskV3.properties[field] = {
    anyOf: [
      recipeScalarSchemas.reference,
      shapeOf(nativeRecipeSchemas[`${kind}.options`], `${kind}.options`),
    ],
  };
taskV3.properties.call = clean(
  nativeRecipeSchemas["call.options"].properties.perform,
);
for (const field of ["value", "state", "arguments", "data"])
  taskV3.properties[field] = { $ref: "#/$defs/expression" };
taskV3.properties.quotaResume = { enum: ["continue", "restart"] };
taskV3.properties.when = { $ref: "#/$defs/condition" };
const actions = [
  "speculation",
  "queued",
  "gate",
  "interactive",
  "artifact",
  "command",
  "agent",
  "value",
  "call",
  "loop",
  "decision",
  "isolated",
];
taskV3.oneOf = actions.map((action) => ({
  required: action === "agent" ? ["agent", "brief"] : [action],
  not: {
    anyOf: actions
      .filter((other) => other !== action)
      .map((other) => ({ required: [other] })),
  },
}));
taskV3.allOf = [
  {
    if: { not: { required: ["artifact"] } },
    then: { not: { required: ["data"] } },
  },
  {
    if: {
      not: { anyOf: [{ required: ["agent"] }, { required: ["isolated"] }] },
    },
    then: { not: { required: ["quotaResume"] } },
  },
  {
    if: { not: { required: ["agent"] } },
    then: {
      not: { anyOf: [{ required: ["brief"] }, { required: ["dispatch"] }] },
    },
  },
  {
    if: { not: { anyOf: [{ required: ["call"] }, { required: ["queued"] }] } },
    then: { not: { required: ["arguments"] } },
  },
  {
    if: { not: { required: ["decision"] } },
    then: { not: { required: ["state"] } },
  },
];
const inputV3 = structuredClone(recipe.$defs.input);
inputV3.properties.type.enum.push("object", "array", "null");
inputV3.properties.default = {};
inputV3.properties.enum.items = {};
inputV3.properties.schema = { type: "object" };
version3.properties.workflow = shapeOf(
  nativeRecipeSchemas["workflow.options"],
  "workflow.options",
);
version3.properties.tasks.items = { $ref: "#/$defs/taskV3" };
version3.properties.inputs.additionalProperties = { $ref: "#/$defs/inputV3" };
recipe.$defs = {
  ...recipe.$defs,
  ...definitions,
  ...expressions,
  taskV3,
  inputV3,
};
recipe.oneOf.push(version3);
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
