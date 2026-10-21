import assert from "node:assert/strict";
import { test } from "node:test";
import {
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

test("architecture check refuses static and dynamic workspace execution cycles while allowing type dependencies", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "outpost-architecture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const application = join(root, "src", "application");
  await mkdir(application, { recursive: true });
  await mkdir(join(root, "scripts"));
  await symlink(
    resolve("node_modules"),
    join(root, "node_modules"),
    "junction",
  );
  const checker = join(root, "scripts", "check-architecture.mjs");
  await copyFile(resolve("scripts/check-architecture.mjs"), checker);
  const check = () => promisify(execFile)(process.execPath, [checker]);
  await writeFile(join(application, "workspace.ts"), 'import "./sandbox.ts";');
  for (const dependency of [
    'export * from "./workspace.ts";',
    'void import("./workspace.ts");',
  ]) {
    await writeFile(join(application, "sandbox.ts"), dependency);
    await assert.rejects(
      check(),
      /Workspace execution modules must not form runtime import cycles/,
    );
  }
  await writeFile(
    join(application, "workspace.ts"),
    'import type { call } from "./sandbox.ts"; export function run(value: typeof call) { return value(); }',
  );
  await writeFile(
    join(application, "sandbox.ts"),
    'import { run } from "./workspace.ts"; export function call(): number { return run(() => 1); }',
  );
  assert.match(
    (await check()).stdout,
    /Architecture checked: 2 source modules/,
  );
});
