// Run the YAML files with outpost recipe run to answer a persisted question directly in the terminal.
// This offline test drives the same CLI through JSON answers in separate processes, without agents or sandboxes.

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("a CLI answer feeds the next recipe step without a custom runtime", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-cli-example-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = resolve(import.meta.dirname, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  const source = await readFile(
    resolve(import.meta.dirname, "outpost.yaml"),
    "utf8",
  );
  await writeFile(
    config,
    source
      .replace(
        "repository: ../..",
        `repository: ${JSON.stringify(resolve(import.meta.dirname, "../.."))}`,
      )
      .replace(
        "./steps.ts",
        JSON.stringify(resolve(import.meta.dirname, "steps.ts")),
      ),
  );
  const cli = (...args: string[]) =>
    spawnSync(
      process.execPath,
      [
        resolve(import.meta.dirname, "../../dist/cli/main.js"),
        "recipe",
        ...args,
        "--file",
        file,
        "--config",
        config,
        "--json",
      ],
      { encoding: "utf8", timeout: 30_000 },
    );
  const pending = cli("run");
  assert.equal(pending.status, 1, pending.stderr);
  const paused = JSON.parse(pending.stdout);
  assert.equal(paused.status, "waiting-input");
  const request = paused.inputRequests[0];
  const answer = join(directory, "answer.json");
  await writeFile(
    answer,
    JSON.stringify({
      executionId: request.executionId,
      key: request.key,
      requestId: request.id,
      actor: "owner",
      value: "Jean",
    }),
  );
  const resumed = cli("answer", "--run-id", "cli-dialogue", "--answer", answer);
  assert.equal(resumed.status, 0, resumed.stderr);
  assert.equal(
    JSON.parse(resumed.stdout).outputs.greeting.value,
    "Hello Jean!",
  );
});
