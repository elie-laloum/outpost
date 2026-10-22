import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);

test("recipe validate imports extensions only when asked", async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), "outpost-validate-extensions-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  const marker = join(directory, "imported.txt");
  await writeFile(
    file,
    "version: 3\nname: summarize\ntasks:\n  - key: summarize\n    call: { $ref: functions.summary }\n    arguments: [a]\n",
  );
  await writeFile(
    config,
    'version: 3\nworkspace: { kind: ephemeral }\nsandbox: { provider: local }\nextensions:\n  summary:\n    module: ./steps.ts\n    export: summary\n    kind: callback\n    contract: call.options.perform\n    version: "1"\nfunctions:\n  summary: { $ref: extensions.summary }\n',
  );
  await writeFile(
    join(directory, "steps.ts"),
    `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(marker)}, "yes");\nexport function summary(value: unknown) {\n  return value;\n}\n`,
  );
  const cli = [
    resolve("src/cli/main.ts"),
    "recipe",
    "validate",
    "--file",
    file,
    "--config",
    config,
  ];
  const plain = await run(process.execPath, [...cli, "--json"]);
  assert.equal(JSON.parse(plain.stdout).extensions, undefined);
  assert.equal(existsSync(marker), false);
  const loaded = await run(process.execPath, [...cli, "--extensions"]);
  assert.equal(
    loaded.stdout,
    "summarize: valid (1 tasks, 1 extensions loaded)\n",
  );
  assert.equal(existsSync(marker), true);
  await writeFile(join(directory, "steps.ts"), "export const other = 1;\n");
  await assert.rejects(
    run(process.execPath, [...cli, "--extensions", "--json"]),
    (error: { stderr: string }) => {
      assert.match(error.stderr, /Missing recipe extension export: summary/);
      return true;
    },
  );
  await assert.rejects(
    run(process.execPath, [
      resolve("src/cli/main.ts"),
      "recipe",
      "validate",
      "--file",
      file,
      "--extensions",
    ]),
    /requires --config/,
  );
});
