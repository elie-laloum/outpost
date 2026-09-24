import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { executeProcess } from "../../src/infrastructure/process.ts";

const cli = resolve("src/cli/main.ts");
const run = (args: string[]) =>
  executeProcess({ executable: process.execPath, arguments: [cli, ...args] });

test("CLI dispatches help and reports unknown or incomplete commands", async () => {
  for (const args of [[], ["--help"]]) {
    const output = await run(args);
    assert.equal(output.status, 0);
    assert.match(output.stdout, /Outpost/);
  }
  for (const args of [
    ["unknown"],
    ["constructor"],
    ["image"],
    ["image", "unknown"],
  ]) {
    const output = await run(args);
    assert.equal(output.status, 1);
    assert.match(output.stderr, /Unknown command/);
  }
  const missing = await run(["init"]);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Headless initialization/);
});

test("CLI initializes a project noninteractively and refuses overwrites", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-cli-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const args = [
    "init",
    "--agent",
    "codex",
    "--provider",
    "local",
    "--directory",
    directory,
    "--repository",
    "../target-repository",
  ];
  const output = await run(args);
  assert.equal(output.status, 0, output.stderr);
  assert.match(
    await readFile(join(directory, "run.ts"), "utf8"),
    /const repository = resolve\(import.meta.dirname, "\.\.\/target-repository"\)/,
  );
  const repeat = await run(args);
  assert.equal(repeat.status, 1);
  assert.match(repeat.stderr, /overwrite/);
});

test("doctor CLI emits a complete JSON report and exits nonzero when Git is absent", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-doctor-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = await executeProcess({
    executable: process.execPath,
    arguments: [
      cli,
      "doctor",
      "--provider",
      "local",
      "--agent",
      "codex",
      "--json",
    ],
    directory,
    variables: { PATH: directory },
  });
  assert.equal(output.status, 1);
  assert.equal(output.stderr, "");
  const report = JSON.parse(output.stdout);
  assert.equal(report.hasFailures, true);
  assert.equal(report.scope, "host");
  assert.ok(
    report.checks.some(
      (check: { id: string; status: string }) =>
        check.id === "host.git" && check.status === "fail",
    ),
  );
  assert.ok(
    report.checks.some(
      (check: { id: string; status: string }) =>
        check.id === "execution" && check.status === "skipped",
    ),
  );
  const invalid = await run(["doctor", "--provider", "constructor"]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown provider/);
});
