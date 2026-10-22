import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { openEditorRoot } from "../../src/infrastructure/editor-files.ts";
import {
  createRecipeEditorSession,
  recipeEditorLayoutPath,
} from "../../src/application/recipe-editor/session.ts";
import { recipeEditorStarters } from "../../src/application/recipe-editor/starters.constants.ts";

async function session(t: { after(run: () => Promise<void>): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-editor-session-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = await openEditorRoot(directory);
  return { directory, editor: createRecipeEditorSession({ root }) };
}

test("starters open as valid unsaved drafts", async (t) => {
  const { directory, editor } = await session(t);
  await mkdir(join(directory, "documents"));
  for (const starter of Object.keys(
    recipeEditorStarters,
  ) as (keyof typeof recipeEditorStarters)[]) {
    const state = await editor.open({
      recipe: `${starter}/recipe.yaml`,
      config: `${starter}/outpost.yaml`,
      starter,
    });
    if (starter === "directory")
      await mkdir(join(directory, starter, "documents"), { recursive: true });
    const checked = starter === "directory" ? await editor.reload() : state;
    assert.deepEqual(checked.diagnostics, [], starter);
    assert.equal(checked.recipe?.exists, false);
    assert.equal(checked.recipe?.dirty, true);
    assert.deepEqual(checked.editable, { recipe: true, config: true });
  }
  await assert.rejects(
    editor.open({ recipe: "missing.yaml" }),
    /does not exist/,
  );
  await assert.rejects(
    editor.open({ recipe: "recipe.txt", starter: "ephemeral" }),
    /must use \.yaml or \.yml/,
  );
  await assert.rejects(
    editor.open({
      recipe: "same.yaml",
      config: "same.yaml",
      starter: "ephemeral",
    }),
    /separate files/,
  );
});

test("edits validate, undo, save and keep positions beside the recipe", async (t) => {
  const { directory, editor } = await session(t);
  let state = await editor.open({
    recipe: "recipe.yaml",
    config: "outpost.yaml",
    starter: "ephemeral",
  });
  state = await editor.edit(
    "recipe",
    [{ type: "rename-task", key: "write", to: "create" }],
    state.revision,
  );
  assert.match(state.recipe!.text, /after: \[create\]/);
  state = await editor.setLayout(
    {
      version: 1,
      nodes: { create: { x: 10.4, y: 20 }, read: { x: 300, y: 20 } },
    },
    state.revision,
  );
  state = await editor
    .edit(
      "recipe",
      [{ type: "connect", source: "read", target: "create" }],
      state.revision,
    )
    .catch((error: unknown) => {
      assert.match(String(error), /dependency cycle/);
      return state;
    });
  state = await editor.edit(
    "recipe",
    [{ type: "set", path: ["tasks", 1, "after"], value: ["unknown"] }],
    state.revision,
  );
  assert.equal(state.diagnostics.length, 1);
  assert.equal(state.diagnostics[0]!.file, "recipe");
  assert.ok(state.diagnostics[0]!.line);
  state = await editor.undo(state.revision);
  assert.deepEqual(state.diagnostics, []);
  assert.equal(state.canRedo, true);
  state = await editor.redo(state.revision);
  assert.equal(state.diagnostics.length, 1);
  state = await editor.undo(state.revision);
  await assert.rejects(editor.edit("recipe", [], state.revision - 1), {
    code: "conflict",
  });
  await assert.rejects(
    editor.edit("config", [{ type: "remove-task", key: "x" }], state.revision),
    /only accept set/,
  );
  state = await editor.edit(
    "config",
    [{ type: "set", path: ["sandbox", "provider"], value: "podman" }],
    state.revision,
  );
  assert.match(state.config!.text, /provider: podman/);
  state = await editor.save();
  assert.equal(state.recipe!.dirty, false);
  assert.equal(state.layoutDirty, false);
  assert.equal(
    await readFile(join(directory, "recipe.yaml"), "utf8"),
    state.recipe!.text,
  );
  assert.deepEqual(
    JSON.parse(
      await readFile(
        join(directory, recipeEditorLayoutPath("recipe.yaml")),
        "utf8",
      ),
    ),
    {
      version: 1,
      nodes: { create: { x: 10, y: 20 }, read: { x: 300, y: 20 } },
    },
  );
  state = await editor.edit(
    "recipe",
    [{ type: "remove-task", key: "read" }],
    state.revision,
  );
  assert.deepEqual(Object.keys(state.layout.nodes), ["create"]);
});

test("disk changes reload clean drafts and block overwriting dirty ones", async (t) => {
  const { directory, editor } = await session(t);
  const recipe = "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n";
  await writeFile(join(directory, "recipe.yaml"), recipe);
  await writeFile(join(directory, "outpost.yaml"), "version: 3\n");
  let state = await editor.open({
    recipe: "recipe.yaml",
    config: "outpost.yaml",
  });
  assert.deepEqual(state.diagnostics, []);
  assert.equal(await editor.checkDisk(), false);
  await writeFile(
    join(directory, "recipe.yaml"),
    recipe.replace("value: 1", "value: 2"),
  );
  assert.equal(await editor.checkDisk(), true);
  state = editor.state();
  assert.match(state.recipe!.text, /value: 2/);
  state = await editor.replaceText(
    "recipe",
    `${state.recipe!.text}# local\n`,
    state.revision,
  );
  await writeFile(
    join(directory, "recipe.yaml"),
    recipe.replace("value: 1", "value: 3"),
  );
  assert.equal(await editor.checkDisk(), true);
  assert.equal(editor.state().recipe!.changedOnDisk, true);
  await assert.rejects(editor.save(), {
    code: "conflict",
    details: { files: ["recipe.yaml"] },
  });
  state = await editor.save({ overwrite: true });
  assert.match(
    await readFile(join(directory, "recipe.yaml"), "utf8"),
    /value: 2\n# local/,
  );
  state = await editor.replaceText("recipe", "tasks: [\n", state.revision);
  assert.equal(state.diagnostics[0]!.code, "invalid-yaml");
  assert.equal(state.editable.recipe, false);
  await assert.rejects(
    editor.edit("recipe", [{ type: "remove-task", key: "a" }], state.revision),
    /Fix the YAML syntax/,
  );
  state = await editor.reload();
  assert.equal(state.recipe!.dirty, false);
  await writeFile(
    join(directory, "old.yaml"),
    "version: 2\nname: n\ntasks:\n  - key: a\n    command: { executable: echo }\n",
  );
  state = await editor.open({ recipe: "old.yaml" });
  assert.equal(state.editable.recipe, false);
  await assert.rejects(
    editor.edit("recipe", [{ type: "remove-task", key: "a" }], state.revision),
    (error: unknown) =>
      error instanceof Error &&
      "diagnostic" in error &&
      (error.diagnostic as { code: string }).code === "unsupported-version",
  );
});

test("planning reads unsaved drafts", async (t) => {
  const { editor } = await session(t);
  const state = await editor.open({
    recipe: "recipe.yaml",
    config: "outpost.yaml",
    starter: "ephemeral",
  });
  await editor.edit(
    "recipe",
    [{ type: "rename-task", key: "read", to: "show" }],
    state.revision,
  );
  const plan = (await editor.plan()) as { tasks: { key: string }[] };
  assert.deepEqual(
    plan.tasks.map((task) => task.key),
    ["write", "show"],
  );
  let unsubscribe = editor.subscribe(() => {
    throw new Error("ignored");
  });
  const seen: number[] = [];
  const second = editor.subscribe((current) => seen.push(current.revision));
  await editor.reload();
  unsubscribe();
  second();
  assert.equal(seen.length, 1);
  unsubscribe = () => undefined;
});
