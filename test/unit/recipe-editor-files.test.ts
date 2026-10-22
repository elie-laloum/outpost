import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  editorFileHash,
  openEditorRoot,
  readEditorFile,
  writeEditorFile,
} from "../../src/infrastructure/editor-files.ts";

async function directory(t: { after(run: () => Promise<void>): void }) {
  const path = await mkdtemp(join(tmpdir(), "outpost-editor-files-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test("editor files stay inside their directory", async (t) => {
  const base = await directory(t);
  const root = await openEditorRoot(join(base, "."));
  const outside = await directory(t);
  await symlink(outside, join(base, "linked"));
  await writeFile(join(outside, "secret.yaml"), "a: 1\n");
  for (const file of [
    "../escape.yaml",
    join(outside, "x.yaml"),
    "",
    "linked/secret.yaml",
    "linked/new/file.yaml",
  ])
    await assert.rejects(root.locate(file), { code: "configuration" }, file);
  await assert.rejects(root.locate(".git/config"), /never writes Git metadata/);
  assert.equal(
    await root.locate("nested/recipe.yaml"),
    join(root.directory, "nested", "recipe.yaml"),
  );
  await assert.rejects(
    openEditorRoot(join(outside, "secret.yaml")),
    /is not a directory/,
  );
});

test("editor writes create, replace and detect concurrent changes", async (t) => {
  const root = await openEditorRoot(await directory(t));
  assert.equal(await readEditorFile(root, "recipe.yaml", 100), undefined);
  const created = await writeEditorFile(
    root,
    "nested/recipe.yaml",
    "a: 1\n",
    null,
  );
  assert.deepEqual(created, {
    path: "nested/recipe.yaml",
    text: "a: 1\n",
    hash: editorFileHash("a: 1\n"),
  });
  await assert.rejects(
    writeEditorFile(root, "nested/recipe.yaml", "a: 2\n", null),
    { code: "conflict" },
  );
  const path = join(root.directory, "nested", "recipe.yaml");
  if (process.platform !== "win32") await chmod(path, 0o600);
  await writeFile(path, "a: 3\n");
  await assert.rejects(
    writeEditorFile(root, "nested/recipe.yaml", "a: 2\n", created.hash),
    { code: "conflict" },
  );
  assert.equal(await readFile(path, "utf8"), "a: 3\n");
  const replaced = await writeEditorFile(
    root,
    "nested/recipe.yaml",
    "a: 4\n",
    editorFileHash("a: 3\n"),
  );
  assert.equal(replaced.text, "a: 4\n");
  assert.equal(await readFile(path, "utf8"), "a: 4\n");
  if (process.platform !== "win32")
    assert.equal((await stat(path)).mode & 0o777, 0o600);
  assert.deepEqual(await readdir(join(root.directory, "nested")), [
    "recipe.yaml",
  ]);
  await assert.rejects(
    readEditorFile(root, "nested/recipe.yaml", 2),
    /exceeds 2 bytes/,
  );
  await mkdir(join(root.directory, "folder"));
  await assert.rejects(
    readEditorFile(root, "folder", 10),
    /not a regular file/,
  );
});
