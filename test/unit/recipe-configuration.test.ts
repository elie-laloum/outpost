import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { readRecipeConfiguration } from "../../src/cli/recipe-configuration.ts";
import { builtInAgents } from "../../src/adapters/agents/catalog.ts";

const file = resolve("workflow/outpost.yaml");
const configuration = (extra: object = {}) =>
  JSON.stringify({
    version: 1,
    repository: "../repository",
    sandbox: { provider: "local" },
    ...extra,
  });

test("YAML configuration composes catalogued agents and resolves paths without allocating", async () => {
  const agents = Object.fromEntries(
    builtInAgents.map((agent) => [
      agent.name,
      { harness: agent.name, authentication: "account" },
    ]),
  );
  const value = await readRecipeConfiguration(
    configuration({ agents }),
    file,
    false,
  );
  assert.equal(value.sandbox.repository, resolve("repository"));
  assert.deepEqual(value.sandbox.branch, { mode: "integrate" });
  assert.deepEqual(
    Object.keys(value.agents!),
    builtInAgents.map((agent) => agent.name),
  );
  for (const provider of ["docker", "podman", "local", "vercel", "daytona"]) {
    const value = await readRecipeConfiguration(
      configuration({ sandbox: { provider } }),
      file,
      false,
    );
    assert.equal(value.sandbox.sandboxProvider?.name, provider);
  }
  const named = await readRecipeConfiguration(
    configuration({
      branch: { mode: "named", name: "outpost/review", from: "main" },
    }),
    file,
    false,
  );
  assert.deepEqual(named.sandbox.branch, {
    mode: "named",
    name: "outpost/review",
    from: "main",
  });
  const credential = await readRecipeConfiguration(
    configuration({
      agents: {
        coder: {
          harness: "codex",
          authentication: { account: { file: "./auth.json" } },
          model: { name: "test-model", reasoning: "high" },
        },
      },
    }),
    file,
    false,
  );
  assert.equal(credential.agents?.coder?.kind, "cli");
});

test("YAML configuration rejects unsupported settings and credential literals", async (t) => {
  const invalid = [
    { version: 2 },
    { unknown: true },
    { repository: "" },
    { sandbox: { provider: "unknown" } },
    { sandbox: { provider: "local", image: "ignored" } },
    { sandbox: { provider: "vercel", memoryMb: 256 } },
    { sandbox: { provider: "docker", cpus: 0 } },
    { branch: { mode: "current", from: "main" } },
    { branch: { mode: "named" } },
    { agents: { coder: { harness: "missing", authentication: "account" } } },
    { agents: { coder: { harness: "codex" } } },
    {
      agents: {
        coder: {
          harness: "codex",
          authentication: { usage: { key: "never-accept-this" } },
        },
      },
    },
    {
      agents: {
        coder: {
          harness: "codex",
          authentication: "usage",
          model: { name: "test", reasoning: "bad" },
        },
      },
    },
    { environment: { API_TOKEN: "not a variable name" } },
  ];
  for (const value of invalid)
    await assert.rejects(
      readRecipeConfiguration(configuration(value), file, false),
    );
  t.mock.property(process, "env", {
    ...process.env,
    OUTPOST_RECIPE_SECRET_FIXTURE: "private-value",
  });
  const value = await readRecipeConfiguration(
    configuration({ environment: { TOKEN: "OUTPOST_RECIPE_SECRET_FIXTURE" } }),
    file,
  );
  assert.equal(
    value.sandbox.sandboxProvider?.variables?.TOKEN,
    "private-value",
  );
  await assert.rejects(
    readRecipeConfiguration(
      configuration({ environment: { TOKEN: "OUTPOST_RECIPE_UNSET_FIXTURE" } }),
      file,
    ),
    /Missing declared environment variable/,
  );
  const validation = await readRecipeConfiguration(
    configuration({ environment: { TOKEN: "OUTPOST_RECIPE_UNSET_FIXTURE" } }),
    file,
    false,
  );
  assert.equal(validation.sandbox.sandboxProvider?.variables?.TOKEN, "");
});
