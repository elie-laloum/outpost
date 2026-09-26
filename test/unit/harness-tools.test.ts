import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineHarnessInstructions,
  defineHarnessTool,
  defineHarnessToolset,
  type StandardJsonSchema,
} from "../../src/index.ts";
import { schemaIssues } from "../../src/domain/tool-schema.ts";

const noop = () => "ok";

test("tool definitions validate names, options and JSON Schema subsets", async () => {
  const tool = defineHarnessTool({
    name: "search_files",
    description: "Search files.",
    input: {
      type: "object",
      properties: {
        pattern: { type: "string", minLength: 1, maxLength: 5 },
        limit: { type: "integer", minimum: 1, maximum: 10 },
        mode: { enum: ["literal", "regex"] },
        paths: { type: "array", items: { type: "string" }, maxItems: 2 },
        exact: { const: true },
        nullable: { type: ["string", "null"] },
        extra: { type: "object", additionalProperties: { type: "number" } },
      },
      required: ["pattern"],
      additionalProperties: false,
    },
    execute: noop,
  });
  assert.equal(tool.readOnly, false);
  assert.ok(Object.isFrozen(tool.inputSchema));
  assert.deepEqual(await tool.validate({ pattern: "a", nullable: null }), {
    value: { pattern: "a", nullable: null },
  });
  const invalid = await tool.validate({
    pattern: "toolong",
    limit: 11.5,
    mode: "glob",
    paths: ["a", 2, "c"],
    exact: false,
    nullable: 1,
    extra: { size: "big" },
    unknown: 1,
  });
  assert.ok("issues" in invalid);
  for (const fragment of [
    "input.pattern must be at most 5 characters",
    "input.limit must be integer",
    'input.mode must be one of ["literal","regex"]',
    "input.paths[1] must be string",
    "input.paths must be at most 2 items",
    "input.exact must equal true",
    "input.nullable must be string or null",
    "input.extra.size must be number",
    "input.unknown is not allowed",
  ])
    assert.ok(invalid.issues.includes(fragment), fragment);
  const missing = await tool.validate({});
  assert.deepEqual(missing, { issues: "input.pattern is required" });
  assert.deepEqual(schemaIssues({ type: "number", minimum: 2 }, 1), [
    "input must be at least 2",
  ]);
  assert.deepEqual(schemaIssues({ type: "array", minItems: 1 }, []), [
    "input must be at least 1 items",
  ]);
  assert.deepEqual(schemaIssues({ type: "string", minLength: 2 }, "é"), [
    "input must be at least 2 characters",
  ]);
  for (const [options, message] of [
    [{ name: "bad name" }, /Tool names/],
    [{ description: " " }, /description/],
    [{ execute: 1 }, /execute/],
    [{ readOnly: "yes" }, /readOnly/],
    [{ extra: true }, /Unsupported tool option/],
    [{ input: [] }, /JSON Schema object/],
    [{ input: { type: "string" } }, /describe an object/],
    [
      { input: { type: "object", pattern: "x" } },
      /Unsupported JSON Schema keyword/,
    ],
    [
      { input: { type: "object", properties: { a: { type: "date" } } } },
      /type/,
    ],
    [{ input: { type: 1 } }, /type must be a name/],
    [{ input: { type: "object", required: [1] } }, /required/],
    [{ input: { type: "object", enum: "a" } }, /enum/],
    [{ input: { type: "object", properties: [] } }, /properties/],
    [{ input: { type: "object", minLength: "1" } }, /minLength/],
    [
      { input: { type: "object", additionalProperties: "no" } },
      /additionalProperties/,
    ],
    [{ input: { type: "object", items: { type: "nope" } } }, /type/],
  ] as const)
    assert.throws(
      () =>
        defineHarnessTool({
          name: "tool",
          description: "Tool.",
          input: { type: "object" },
          execute: noop,
          ...(options as object),
        }),
      message,
    );
});

test("Standard JSON Schema tools convert their schema and report issues", async () => {
  const schema: StandardJsonSchema<{ path: string }> = {
    "~standard": {
      validate: async (value) =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { path?: unknown }).path === "string"
          ? { value: value as { path: string } }
          : {
              issues: [
                { message: "Expected string", path: [{ key: "path" }] },
                "raw issue",
              ],
            },
      jsonSchema: {
        input: ({ target }) => ({
          $schema: `https://json-schema.org/${target}`,
          type: "object",
          properties: { path: { type: "string" } },
        }),
      },
    },
  };
  const tool = defineHarnessTool({
    name: "read",
    description: "Read.",
    readOnly: true,
    input: schema,
    execute: (input) => input.path,
  });
  assert.deepEqual(tool.inputSchema, {
    type: "object",
    properties: { path: { type: "string" } },
  });
  assert.deepEqual(await tool.validate({ path: "a" }), {
    value: { path: "a" },
  });
  assert.deepEqual(await tool.validate({}), {
    issues: "path: Expected string; raw issue",
  });
  assert.throws(
    () =>
      defineHarnessTool({
        name: "bad",
        description: "Bad.",
        input: {
          "~standard": {
            validate: () => ({ issues: [] }),
            jsonSchema: { input: () => ({ type: "string" }) },
          },
        },
        execute: noop,
      }),
    /JSON Schema object/,
  );
});

test("toolsets flatten nested tools and reject duplicates", () => {
  const a = defineHarnessTool({
    name: "a",
    description: "A.",
    input: { type: "object" },
    execute: noop,
  });
  const b = defineHarnessTool({
    name: "b",
    description: "B.",
    input: { type: "object" },
    execute: noop,
  });
  const inner = defineHarnessToolset({ name: "inner", tools: [b] });
  const outer = defineHarnessToolset({ name: "outer", tools: [a, inner] });
  assert.deepEqual(
    outer.tools.map((tool) => tool.name),
    ["a", "b"],
  );
  assert.throws(
    () => defineHarnessToolset({ name: "dup", tools: [a, outer] }),
    /Duplicate tool name: a/,
  );
  assert.throws(
    () => defineHarnessToolset({ name: " ", tools: [] }),
    /Toolset name/,
  );
  assert.throws(
    // @ts-expect-error Toolsets require an array.
    () => defineHarnessToolset({ name: "x", tools: a }),
    /array/,
  );
});

test("instructions accept text or resolvers that return text", async () => {
  const context = {
    sandbox: {} as never,
    signal: AbortSignal.timeout(1_000),
    model: { name: "m" },
  };
  assert.equal(
    await defineHarnessInstructions("Be brief.").resolve(context),
    "Be brief.",
  );
  assert.equal(
    await defineHarnessInstructions(
      ({ model }) => `Use ${model.name}.`,
    ).resolve(context),
    "Use m.",
  );
  assert.throws(() => defineHarnessInstructions(" "), /nonempty text/);
  await assert.rejects(
    defineHarnessInstructions(() => 1 as never).resolve(context),
    /resolve to text/,
  );
});
