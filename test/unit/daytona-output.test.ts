import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { daytonaCommandScript } from "../../src/providers/daytona-command.constants.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { daytonaOutput } from "../../src/providers/daytona-output.ts";
import { daytonaOutputPrefix } from "../../src/providers/daytona-command.constants.ts";

test("Daytona output decodes fragmented frames and split Unicode without adding line endings", () => {
  const bytes = Buffer.from("file\0é🐱\n\n");
  const frames = [...bytes]
    .map(
      (byte) =>
        daytonaOutputPrefix + Buffer.from([byte]).toString("base64") + "\n",
    )
    .join("");
  let result = "";
  const output = daytonaOutput((text) => {
    result += text;
  });
  for (const character of frames) output.write(character);
  output.close();
  assert.equal(result, bytes.toString("utf8"));
});

test("Daytona output retains launch errors outside encoded command output", () => {
  let result = "";
  const output = daytonaOutput((text) => {
    result += text;
  });
  output.write("node: not found\n");
  output.write("out");
  output.close();
  assert.equal(result, "node: not found\nout");
});

test("Daytona output decodes frames after raw lines for every chunk boundary", () => {
  const frame = (value: string) =>
    daytonaOutputPrefix + Buffer.from(value).toString("base64") + "\n";
  const wire =
    "warning: startup\n" +
    frame("héllo\n") +
    "raw outpost-output:literal\n" +
    frame("done");
  const expected = "warning: startup\nhéllo\nraw outpost-output:literal\ndone";
  for (let boundary = 0; boundary <= wire.length; boundary++) {
    let result = "";
    const output = daytonaOutput((text) => {
      result += text;
    });
    output.write(wire.slice(0, boundary));
    output.write(wire.slice(boundary));
    output.close();
    assert.equal(result, expected, `boundary ${boundary}`);
  }
  let result = "";
  const output = daytonaOutput((text) => {
    result += text;
  });
  for (const character of wire) output.write(character);
  output.close();
  assert.equal(result, expected);
});

test("Daytona command wrapper reads private variables, removes staging and preserves nonzero exit", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-daytona-env-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const environment = join(directory, "environment.json");
  const secret = "quoted'\nvalue";
  await writeFile(
    environment,
    JSON.stringify({ OUTPOST_TEST_SECRET: secret }),
    { mode: 0o600 },
  );
  let stdout = "";
  const output = daytonaOutput((text) => {
    stdout += text;
  });
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "-e",
      daytonaCommandScript,
      "--",
      environment,
      process.execPath,
      "-e",
      "process.stdout.write(process.env.OUTPOST_TEST_SECRET);process.exitCode=7",
    ],
    observe(channel, text) {
      if (channel === "stdout") output.write(text);
    },
  });
  output.close();
  assert.equal(result.status, 7);
  assert.equal(stdout, secret);
  await assert.rejects(readFile(environment), { code: "ENOENT" });
});
