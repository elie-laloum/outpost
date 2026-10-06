import assert from "node:assert/strict";
import { test } from "node:test";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";

for (const create of [
  createVercelSandboxProvider,
  createDaytonaSandboxProvider,
]) {
  test(`${create.name} uses isolated remote placement by default and explicitly`, () => {
    assert.equal(create().placement, "remote");
    assert.equal(create({ repositoryMode: "isolated" }).placement, "remote");
  });

  test(`${create.name} rejects unsupported repository modes before connecting`, () => {
    for (const repositoryMode of ["mounted", "host", "unknown", null])
      assert.throws(
        () =>
          Reflect.apply(create, undefined, [
            { repositoryMode },
            () => {
              assert.fail("Invalid repository modes must not connect");
            },
          ]),
        { code: "configuration", message: /repositoryMode must be isolated/ },
      );
  });
}
