import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { Observation } from "../../src/domain/observation.types.ts";

const secret = "events-secret-value-7f3a";

async function project(t: { after(run: () => Promise<void>): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-events-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    [
      "version: 3",
      "name: events",
      "tasks:",
      "  - key: echo",
      "    command:",
      "      executable: node",
      "      arguments: [-e, \"console.log('token=' + process.env.TOKEN)\"]",
      "",
    ].join("\n"),
  );
  await writeFile(
    config,
    [
      "version: 3",
      "workspace: { kind: ephemeral }",
      "sandbox:",
      "  provider: local",
      "  variables:",
      "    TOKEN: { env: EVENTS_TOKEN }",
      "",
    ].join("\n"),
  );
  return { directory, file, config };
}

function cli(directory: string, ...args: string[]) {
  return spawnSync(
    process.execPath,
    [resolve("src/cli/main.ts"), "recipe", ...args],
    {
      cwd: directory,
      encoding: "utf8",
      env: { ...process.env, EVENTS_TOKEN: secret },
    },
  );
}

test("recipe run --events appends redacted observations as JSON lines", async (t) => {
  const { directory, file, config } = await project(t);
  const events = join(directory, "events.ndjson");
  const run = cli(
    directory,
    "run",
    "--file",
    file,
    "--config",
    config,
    "--events",
    events,
    "--json",
    "--no-interactive",
  );
  assert.equal(run.status, 0, run.stderr);
  assert.equal(JSON.parse(run.stdout).status, "done");
  const text = await readFile(events, "utf8");
  assert.ok(!text.includes(secret), "resolved variables are redacted");
  const lines = text
    .trimEnd()
    .split("\n")
    .map((line) => {
      return JSON.parse(line) as Observation;
    });
  assert.deepEqual(
    lines.map((line) => line.seq),
    lines.map((_, index) => index + 1),
  );
  const output = lines.find((line) => line.event.kind === "command-output");
  assert.equal(output?.scope.taskKey, "echo");
  assert.match(JSON.stringify(output?.event), /token=\[REDACTED\]/);
  assert.ok(
    lines.some(
      (line) =>
        line.event.kind === "workflow" && line.event.event.type === "finish",
    ),
  );
  if (process.platform !== "win32")
    assert.equal((await stat(events)).mode & 0o777, 0o600);
});

test("recipe --events requires a YAML configuration", async (t) => {
  const { directory, file } = await project(t);
  const module = join(directory, "outpost.mjs");
  await writeFile(module, "export default {};\n");
  const run = cli(
    directory,
    "run",
    "--file",
    file,
    "--config",
    module,
    "--events",
    join(directory, "events.ndjson"),
  );
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /--events requires YAML configuration/);
});
