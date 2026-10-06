import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineJsonResponse,
  defineTextResponse,
} from "../../src/domain/response.ts";
import { responseInstructions } from "../../src/domain/response-instructions.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import type { StandardJsonSchema } from "../../src/domain/tool.types.ts";
import type {
  JsonResponseOptions,
  ResponseSpec,
} from "../../src/domain/response.types.ts";

const convertible: StandardJsonSchema<number> = {
  "~standard": {
    validate(input) {
      return typeof input === "string"
        ? { value: input.length }
        : { issues: ["Expected string"] };
    },
    jsonSchema: {
      input({ target }) {
        assert.equal(target, "draft-2020-12");
        return { type: "string", minLength: 1 };
      },
    },
  },
};

test("JSON response instructions use the validator's input schema and preserve output inference", async () => {
  const response = defineJsonResponse({ tag: "length", schema: convertible });
  const inferred: Promise<number> = response.read('<length>"hello"</length>');
  assert.equal(await inferred, 5);
  assert.equal(response.format, "json");
  assert.deepEqual(response.jsonSchema, { type: "string", minLength: 1 });
  const prompt = responseInstructions(response);
  assert.match(prompt, /conflicting response format/);
  assert.match(prompt, /Keep following the task instructions/);
  assert.match(prompt, /exactly one <length>\.\.\.<\/length>/);
  assert.match(prompt, /without a Markdown code fence/);
  assert.match(prompt, /"type": "string"/);
  assert.doesNotMatch(prompt, /"type": "number"/);
});

test("explicit schemas take precedence and are captured with nested immutability", async () => {
  const original = { type: "array", items: { type: "number" } };
  const response = defineJsonResponse({
    tag: "n",
    schema: convertible,
    jsonSchema: original,
  });
  original.items.type = "boolean";
  assert.deepEqual(response.jsonSchema, {
    type: "array",
    items: { type: "number" },
  });
  assert.ok(Object.isFrozen(response.jsonSchema));
  assert.ok(Object.isFrozen(response.jsonSchema?.items));
  assert.equal(await response.read('<n>"abc"</n>'), 3);
  await assert.rejects(response.read("<n>[1]</n>"), /Expected string/);
  const failingConverter = {
    "~standard": {
      ...convertible["~standard"],
      jsonSchema: {
        input() {
          throw new Error("must not run");
        },
      },
    },
  };
  assert.doesNotThrow(() =>
    defineJsonResponse({ tag: "n", schema: failingConverter, jsonSchema: {} }),
  );
});

test("JSON Schema snapshots exclude non-enumerable Standard Schema protocol metadata", () => {
  const converted = Object.defineProperty({ type: "string" }, "~standard", {
    value: convertible["~standard"],
    enumerable: false,
  });
  const schema = {
    "~standard": {
      ...convertible["~standard"],
      jsonSchema: { input: () => converted },
    },
  };
  const automatic = defineJsonResponse({ tag: "x", schema });
  const explicit = defineJsonResponse({
    tag: "x",
    schema,
    jsonSchema: converted,
  });
  assert.deepEqual(automatic.jsonSchema, { type: "string" });
  assert.deepEqual(explicit.jsonSchema, { type: "string" });
  assert.equal(Object.hasOwn(automatic.jsonSchema!, "~standard"), false);
  const otherMetadata = Object.defineProperty({ type: "string" }, "hidden", {
    value: () => true,
  });
  assert.throws(
    () => defineJsonResponse({ tag: "x", schema, jsonSchema: otherMetadata }),
    OutpostError,
  );
});

test("response schemas support arrays, primitives, unions and arbitrary JSON Schema keywords", () => {
  for (const jsonSchema of [
    { type: "array", items: { type: "boolean" } },
    { type: "number" },
    {
      anyOf: [{ type: "null" }, { type: "string" }],
      $defs: { value: { type: "string" } },
    },
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $ref: "https://example.invalid/schema",
    },
    {},
  ]) {
    const response = defineJsonResponse({
      tag: "value",
      schema: (value) => value,
      jsonSchema,
    });
    assert.deepEqual(response.jsonSchema, jsonSchema);
    assert.ok(
      responseInstructions(response).includes(
        JSON.stringify(jsonSchema, null, 2),
      ),
    );
  }
});

test("missing schemas, conversion failures and non-lossless schema values fail at definition", () => {
  const failure = new Error("Cannot represent input");
  const failing = {
    "~standard": {
      ...convertible["~standard"],
      jsonSchema: {
        input() {
          throw failure;
        },
      },
    },
  };
  assert.throws(
    () => defineJsonResponse({ tag: "x", schema: failing }),
    (error) =>
      error instanceof OutpostError &&
      error.code === "configuration" &&
      error.cause === failure,
  );
  assert.throws(
    // @ts-expect-error Opaque parsers require an explicit JSON Schema.
    () => defineJsonResponse({ tag: "x", schema: (value: unknown) => value }),
    OutpostError,
  );
  assert.throws(
    () =>
      // @ts-expect-error Standard validation alone cannot describe the input schema.
      defineJsonResponse({
        tag: "x",
        schema: { "~standard": { validate: () => ({ value: true }) } },
      }),
    OutpostError,
  );
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const getter = Object.defineProperty({}, "type", {
    enumerable: true,
    get() {
      throw new Error("Getter must not run");
    },
  });
  for (const jsonSchema of [
    undefined,
    null,
    [],
    true,
    { type: undefined },
    { value: NaN },
    { value: Infinity },
    { value: -0 },
    { value: 1n },
    { value: () => true },
    { value: new Date() },
    { items: new Array(1) },
    { value: Symbol("x") },
    cycle,
    getter,
    { [Symbol("x")]: 1 },
  ]) {
    const options: JsonResponseOptions<unknown> = {
      tag: "x",
      schema: (value: unknown) => value,
      // @ts-expect-error Deliberately malformed external schema data.
      jsonSchema,
    };
    assert.throws(
      () => defineJsonResponse(options),
      (error) =>
        error instanceof OutpostError && error.code === "configuration",
    );
  }
});

test("text and legacy response contracts always receive format instructions", () => {
  const text = defineTextResponse({ tag: "summary" });
  assert.equal(text.format, "text");
  assert.match(responseInstructions(text), /requested text/);
  const legacy: ResponseSpec<string> = {
    tag: "old",
    repairs: 0,
    read: async (value) => value,
  };
  assert.match(responseInstructions(legacy), /<old>/);
  assert.doesNotMatch(responseInstructions(legacy), /JSON/);
  assert.throws(
    () => responseInstructions({ ...legacy, format: "json" }),
    OutpostError,
  );
  assert.throws(
    // @ts-expect-error Unsupported formats must fail even for untyped callers.
    () => responseInstructions({ ...legacy, format: "xml" }),
    OutpostError,
  );
});
