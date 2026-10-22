import assert from "node:assert/strict";
import { test } from "node:test";
import { hostAgentHomes } from "../fixtures/host-environment.constants.ts";

test("tests run without the host CLI home variables", () => {
  for (const variable of hostAgentHomes)
    assert.equal(
      process.env[variable],
      undefined,
      `${variable} reached the tests; run them through bun run test or add --import ./test/setup.ts`,
    );
});
