import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { verifyRecoveryTransfer } from "../../src/application/recovery-verification.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

async function transfer(root: string) {
  const path = join(root, ".outpost", "recovery", "transfer");
  await mkdir(path, { recursive: true });
  const previous = (await git(root, ["rev-parse", "HEAD"])).trim();
  await writeFile(join(root, "base.txt"), "staged\n");
  await git(root, ["add", "base.txt"]);
  await git(root, [
    "diff",
    "--cached",
    "--binary",
    `--output=${join(path, "previous-index.patch")}`,
  ]);
  await writeFile(join(root, "base.txt"), "unstaged\n");
  await git(root, [
    "diff",
    "HEAD",
    "--binary",
    `--output=${join(path, "previous.patch")}`,
  ]);
  await git(root, ["reset", "--hard", previous]);
  await writeFile(join(root, "next.txt"), "committed remote\n");
  await git(root, ["add", "next.txt"]);
  await git(root, ["commit", "-m", "next"]);
  const next = (await git(root, ["rev-parse", "HEAD"])).trim();
  await git(root, ["bundle", "create", join(path, "commits.bundle"), "HEAD"]);
  await writeFile(join(root, "base.txt"), "remote edit\n");
  await git(root, [
    "diff",
    "HEAD",
    "--binary",
    `--output=${join(path, "remote.patch")}`,
  ]);
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({ previous, next, previousExtras: [], incoming: [] }),
  );
  return path;
}

test("restorability verifies actual bundle objects and applies all three patches in isolation without changing host work or metadata", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  const before = {
    head: await git(root, ["rev-parse", "HEAD"]),
    status: await git(root, ["status", "--porcelain"]),
    index: await readFile(join(root, ".git", "index")),
    reflog: await readFile(join(root, ".git", "logs", "HEAD")),
    file: await readFile(join(root, "base.txt")),
  };
  const report = await verifyRecoveryTransfer(path, {
    restorability: true,
    repository: root,
  });
  assert.equal(report.complete, true, JSON.stringify(report));
  assert.equal(report.scope, "transfer-restorability");
  assert.equal(
    report.checks.filter((check) => check.code === "PATCH_APPLIES").length,
    3,
  );
  assert.ok(
    report.checks.some((check) => check.code === "BUNDLE_OBJECTS_VALID"),
  );
  assert.equal(await git(root, ["rev-parse", "HEAD"]), before.head);
  assert.equal(await git(root, ["status", "--porcelain"]), before.status);
  assert.deepEqual(await readFile(join(root, ".git", "index")), before.index);
  assert.deepEqual(
    await readFile(join(root, ".git", "logs", "HEAD")),
    before.reflog,
  );
  assert.deepEqual(await readFile(join(root, "base.txt")), before.file);
});

test("structurally valid corruption fails actual patch and bundle verification", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  await writeFile(join(path, "remote.patch"), "not a patch\n");
  assert.equal((await verifyRecoveryTransfer(path)).complete, true);
  let result = await verifyRecoveryTransfer(path, {
    restorability: true,
    repository: root,
  });
  assert.equal(result.complete, false);
  assert.ok(
    result.checks.some((check) => check.code === "PATCH_REMOTE_PATCH_FAILED"),
  );
  await writeFile(join(path, "remote.patch"), "");
  await writeFile(join(path, "commits.bundle"), "not a bundle\n");
  result = await verifyRecoveryTransfer(path, {
    restorability: true,
    repository: root,
  });
  assert.ok(
    result.checks.some((check) => check.code === "BUNDLE_OBJECTS_FAILED"),
  );
  await assert.rejects(
    verifyRecoveryTransfer(path, { restorability: true }),
    /requires a repository/,
  );
});

test("restorability CLI exposes explicit scope and fails unavailable commits without writing the source checkout", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  const run = () =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("src/cli/main.ts"),
        "recovery",
        "verify",
        "--directory",
        path,
        "--restorability",
        "--repository",
        root,
        "--json",
      ],
    });
  const passed = await run();
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal(JSON.parse(passed.stdout).scope, "transfer-restorability");
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({
      previous: "a".repeat(40),
      next: "a".repeat(40),
      previousExtras: [],
      incoming: [],
    }),
  );
  const failed = await run();
  assert.equal(failed.status, 1);
  assert.ok(
    JSON.parse(failed.stdout).checks.some(
      (check: { code: string }) => check.code === "COMMIT_OBJECTS_FAILED",
    ),
  );
});

test("verification ignores host Git filters and inherited repository redirection", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, ".gitattributes"), "*.txt filter=sentinel\n");
  await git(root, ["add", ".gitattributes"]);
  await git(root, ["commit", "-m", "attributes"]);
  const path = await transfer(root);
  const marker = join(root, "filter-executed");
  const config = join(root, "global.gitconfig");
  const filter = join(root, "sentinel.cjs");
  await writeFile(
    filter,
    `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "executed");`,
  );
  await git(root, [
    "config",
    "--file",
    config,
    "filter.sentinel.smudge",
    `"${process.execPath.replaceAll("\\", "/")}" "${filter.replaceAll("\\", "/")}"`,
  ]);
  await git(root, [
    "config",
    "--file",
    config,
    "filter.sentinel.required",
    "true",
  ]);
  const control = await executeProcess({
    executable: "git",
    arguments: ["cat-file", "--filters", "HEAD:base.txt"],
    directory: root,
    variables: { GIT_CONFIG_GLOBAL: config },
  });
  assert.equal(control.status, 0, control.stderr);
  assert.equal(await readFile(marker, "utf8"), "executed");
  await rm(marker);
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      resolve("src/cli/main.ts"),
      "recovery",
      "verify",
      "--directory",
      path,
      "--repository",
      root,
      "--restorability",
      "--json",
    ],
    variables: {
      GIT_CONFIG_GLOBAL: config,
      GIT_DIR: join(root, "nonexistent-redirect"),
    },
  });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  await assert.rejects(readFile(marker), { code: "ENOENT" });
});

test("promisor and alternate object sources are explicitly unsupported without source changes", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  await git(root, ["config", "remote.origin.promisor", "true"]);
  const before = await readFile(join(root, ".git", "config"));
  const result = await verifyRecoveryTransfer(path, {
    restorability: true,
    repository: root,
  });
  assert.equal(result.complete, false);
  assert.ok(result.checks.some((check) => check.code === "SOURCE_UNSUPPORTED"));
  assert.deepEqual(await readFile(join(root, ".git", "config")), before);
  await git(root, ["config", "--unset", "remote.origin.promisor"]);
  await writeFile(
    join(root, ".git", "objects", "info", "alternates"),
    "/missing/object/source\n",
  );
  const alternate = await verifyRecoveryTransfer(path, {
    restorability: true,
    repository: root,
  });
  assert.ok(
    alternate.checks.some((check) => check.code === "SOURCE_UNSUPPORTED"),
  );
});
