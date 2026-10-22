import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { openEditorRoot } from "../../src/infrastructure/editor-files.ts";
import { createRecipeEditorSession } from "../../src/application/recipe-editor/session.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";

const recipe = `version: 3
name: scene
# Tasks keep their comments.
tasks:
  - key: draft
    command: { executable: "true" }
  - key: review # reads the draft
    command: { executable: "true" }
    after: [draft]
`;

const config = `version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
# Named zones keep their comments.
workspaces:
  docs: { kind: ephemeral }
`;

async function open(
  t: { after(run: () => Promise<void>): void },
  files = { recipe, config },
) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-editor-scene-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "recipe.yaml"), files.recipe);
  await writeFile(join(directory, "outpost.yaml"), files.config);
  const editor = createRecipeEditorSession({
    root: await openEditorRoot(directory),
  });
  await editor.open({ recipe: "recipe.yaml", config: "outpost.yaml" });
  return editor;
}

function refusal(code: string, pattern: RegExp) {
  return (error: unknown) => {
    assert.ok(error instanceof ConfigurationError, String(error));
    assert.equal(error.diagnostic.code, code);
    assert.match(error.message, pattern);
    return true;
  };
}

test("zones are added, placed, renamed and removed across the recipe and its configuration", async (t) => {
  const editor = await open(t);
  let state = await editor.editScene(
    [
      {
        type: "add-zone",
        kind: "sandbox",
        name: "check",
        workspace: "workspaces.docs",
        declaration: { provider: "local" },
      },
      { type: "place-task", key: "review", zone: "sandboxes.check" },
    ],
    editor.state().revision,
  );
  assert.deepEqual(state.diagnostics, []);
  assert.match(
    state.recipe!.text,
    /# reads the draft\n {4}command:.*\n {4}after: \[draft\]\n {4}sandbox: check\n/,
  );
  assert.match(
    state.config!.text,
    /sandboxes:\n {2}check:\n {4}workspace: \{ \$ref: workspaces\.docs \}\n {4}provider: local\n/,
  );
  state = await editor.editScene(
    [
      { type: "rename-zone", zone: "sandboxes.check", to: "verify" },
      { type: "rename-zone", zone: "workspaces.docs", to: "notes" },
    ],
    state.revision,
  );
  assert.match(state.recipe!.text, /sandbox: verify\n/);
  assert.match(
    state.config!.text,
    /# Named zones keep their comments\.\nworkspaces:\n {2}notes: \{ kind: ephemeral \}\n/,
  );
  assert.match(
    state.config!.text,
    /verify:\n {4}workspace: \{ \$ref: workspaces\.notes \}\n/,
  );
  assert.deepEqual(state.diagnostics, []);
  state = await editor.editScene(
    [
      {
        type: "place-sandbox",
        sandbox: "sandboxes.verify",
        workspace: "workspace",
      },
      {
        type: "set-feature",
        zone: "sandboxes.verify",
        feature: "variables",
        value: { MODE: "check" },
      },
    ],
    state.revision,
  );
  assert.doesNotMatch(state.config!.text, /\$ref: workspaces\.notes/);
  assert.match(
    state.config!.text,
    /verify:\n {4}provider: local\n {4}variables:\n {6}MODE: check\n/,
  );
  await assert.rejects(
    editor.editScene(
      [
        {
          type: "set-feature",
          zone: "sandboxes.verify",
          feature: "volumes",
          value: [],
        },
      ],
      state.revision,
    ),
    refusal(
      "invalid-placement",
      /Sandbox provider local does not accept volumes/,
    ),
  );
  await assert.rejects(
    editor.editScene(
      [{ type: "place-task", key: "review", zone: "workspace" }],
      state.revision,
    ),
    refusal("invalid-placement", /run in a sandbox zone/),
  );
  await assert.rejects(
    editor.editScene(
      [{ type: "rename-zone", zone: "sandboxes.verify", to: "bad name" }],
      state.revision,
    ),
    refusal("invalid-value", /Invalid name bad name/),
  );
  assert.equal(editor.state().revision, state.revision);
  state = await editor.editScene(
    [
      { type: "remove-zone", zone: "sandboxes.verify" },
      { type: "remove-zone", zone: "workspaces.notes" },
    ],
    state.revision,
  );
  assert.equal(state.recipe!.text, recipe);
  assert.doesNotMatch(state.config!.text, /sandboxes|workspaces/);
  assert.deepEqual(state.diagnostics, []);
  state = await editor.undo(state.revision);
  assert.match(state.recipe!.text, /sandbox: verify/);
  assert.match(state.config!.text, /notes: \{ kind: ephemeral \}/);
});

test("entities are renamed with their references, refused while referenced and extracted from inline declarations", async (t) => {
  const editor = await open(t, {
    recipe: `version: 3
name: entities
tasks:
  - key: write
    agent: coder
  - key: side
    isolated:
      sandboxProvider: { type: local }
      agent: { $ref: agents.coder }
`,
    config: `version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
agents:
  coder: { harness: codex, authentication: account }
  backup:
    type: fallback
    agents: [{ $ref: agents.coder }]
`,
  });
  let state = await editor.editScene(
    [{ type: "rename-entity", entity: "agents.coder", to: "writer" }],
    editor.state().revision,
  );
  assert.match(state.recipe!.text, /- key: write\n {4}agent: writer\n/);
  assert.match(state.recipe!.text, /agent: \{ \$ref: agents\.writer \}/);
  assert.match(
    state.config!.text,
    /agents:\n {2}writer: \{ harness: codex, authentication: account \}\n/,
  );
  assert.match(state.config!.text, /agents: \[\{ \$ref: agents\.writer \}\]/);
  await assert.rejects(
    editor.editScene(
      [{ type: "remove-entity", entity: "agents.writer" }],
      state.revision,
    ),
    refusal(
      "referenced-entity",
      /task:write, task:side, entity:agents\.backup/,
    ),
  );
  state = await editor.editScene(
    [
      {
        type: "extract",
        role: "recipe",
        path: ["tasks", 1, "isolated", "sandboxProvider"],
        family: "sandboxProviders",
        name: "host",
      },
      { type: "remove-entity", entity: "agents.backup" },
    ],
    state.revision,
  );
  assert.match(
    state.recipe!.text,
    /sandboxProvider: \{ \$ref: sandboxProviders\.host \}/,
  );
  assert.match(
    state.config!.text,
    /sandboxProviders:\n {2}host:\n {4}type: local\n/,
  );
  assert.doesNotMatch(state.config!.text, /backup/);
  await assert.rejects(
    editor.editScene(
      [
        {
          type: "extract",
          role: "recipe",
          path: ["tasks", 1, "isolated", "sandboxProvider"],
          family: "sandboxProviders",
          name: "again",
        },
      ],
      state.revision,
    ),
    refusal("invalid-value", /Only an inline component/),
  );
  await assert.rejects(
    editor.editScene(
      [{ type: "add-entity", family: "unknown", name: "x", declaration: {} }],
      state.revision,
    ),
    refusal("unknown-reference", /Unknown configuration family unknown/),
  );
  state = await editor.editScene(
    [
      {
        type: "add-entity",
        family: "transports",
        name: "state",
        declaration: { type: "local", directory: "./state" },
      },
    ],
    state.revision,
  );
  assert.match(
    state.config!.text,
    /transports:\n {2}state:\n {4}type: local\n/,
  );
  await assert.rejects(
    editor.editScene(
      [
        {
          type: "add-entity",
          family: "transports",
          name: "state",
          declaration: {},
        },
      ],
      state.revision,
    ),
    refusal("duplicate-key", /transports\.state already exists/),
  );
});
