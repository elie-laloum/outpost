import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { recipeSchemaAssets } from "./recipe-schema-assets.mjs";
import { recipeSchemaNames } from "./recipe-schema-assets.constants.mjs";

async function fixture(context) {
  const root = await mkdtemp(join(tmpdir(), "outpost-schema-assets-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "Schema test",
        GIT_AUTHOR_EMAIL: "schema@example.test",
        GIT_COMMITTER_NAME: "Schema test",
        GIT_COMMITTER_EMAIL: "schema@example.test",
      },
    });
  git("init", "--initial-branch=main");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", root);
  const write = async (version, label) => {
    await writeFile(join(root, "package.json"), JSON.stringify({ version }));
    for (const name of recipeSchemaNames)
      await writeFile(
        join(root, name),
        JSON.stringify({ title: `${label}: ${name}`, type: "object" }) + "\n",
      );
  };
  const commit = () => {
    git("add", ".");
    git("commit", "-m", "Schema fixture");
  };
  return { root, git, write, commit };
}

test("current schemas evolve while archived tag bytes survive later builds", async (context) => {
  const { root, git, write, commit } = await fixture(context);
  await writeFile(join(root, "package.json"), '{"version":"0.9.0"}');
  commit();
  git("tag", "v0.9.0");
  await write("1.0.0", "first");
  commit();
  git("tag", "v1.0.0");
  const first = new Map(
    (await recipeSchemaAssets(root)).map(({ path, body }) => [path, body]),
  );
  await write("1.1.0-rc.1", "preview");
  commit();
  git("tag", "v1.1.0-rc.1");
  await write("1.1.0", "second");
  commit();
  git("tag", "v1.1.0");
  await write("1.1.0", "unreleased changes");
  const next = new Map(
    (await recipeSchemaAssets(root)).map(({ path, body }) => [path, body]),
  );
  assert.equal(next.size, 6);
  for (const name of recipeSchemaNames) {
    assert.equal(first.get(name), first.get(`1.0.0/${name}`));
    assert.equal(next.get(`1.0.0/${name}`), first.get(name));
    assert.match(next.get(name), /unreleased changes/);
    assert.match(next.get(`1.1.0/${name}`), /second/);
  }
  assert.ok(![...next.keys()].some((path) => /0\.9\.0|rc\.1/.test(path)));
});

test("archives reject tags whose package version does not match", async (context) => {
  const { root, git, write, commit } = await fixture(context);
  await write("1.0.0", "first");
  commit();
  git("tag", "v2.0.0");
  await assert.rejects(recipeSchemaAssets(root), /does not match package.json/);
});

test("shallow builds fail instead of dropping historical schema URLs", async (context) => {
  const { root, git, write, commit } = await fixture(context);
  await write("1.0.0", "first");
  commit();
  const clone = join(root, "shallow");
  git("clone", "--depth=1", pathToFileURL(root).href, clone);
  await assert.rejects(recipeSchemaAssets(clone), /require full Git history/);
});
