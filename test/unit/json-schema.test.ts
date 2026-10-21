import assert from "node:assert/strict";
import test from "node:test";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import {
  createJsonDecoder,
  validateJsonSchema,
} from "../../src/infrastructure/json-schema.ts";

const reportSchema = {
  type: "object",
  required: ["name"],
  properties: { name: { type: "string" } },
  additionalProperties: false,
} as const;

test("JSON decoders bind one schema and locate each rejected value", () => {
  const decoder = createJsonDecoder<{ name: string }>(reportSchema, "reports");
  assert.equal(decoder.schema, reportSchema);
  const value = { name: "summary" };
  assert.equal(decoder.parse(value), value);
  assert.throws(
    () => decoder.parse({ name: 1 }, "reports.2"),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "invalid-schema" &&
      error.message.startsWith("reports.2: ") &&
      JSON.stringify(error.diagnostic.path) === '["reports",2,"name"]',
  );
  assert.throws(
    () => decoder.parse({}),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      JSON.stringify(error.diagnostic.path) === '["reports"]',
  );
});

test("schema validation without a decoder only accepts or rejects", () => {
  assert.equal(
    validateJsonSchema(reportSchema, { name: "summary" }, "inputs.report"),
    undefined,
  );
  assert.throws(
    () => validateJsonSchema(reportSchema, [], "inputs.report"),
    /inputs\.report: /,
  );
});
