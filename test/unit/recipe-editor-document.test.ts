import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import {
  planRecipeEdit,
  recipeEditorGraph,
  recipeEditorLayout,
  updateRecipeEditorSceneLayout,
  updateRecipeEditorLayout,
} from "../../src/domain/recipes/editor.ts";
import {
  applyDocumentMutations,
  editableYamlValue,
  openEditableYaml,
  serializeEditableYaml,
} from "../../src/infrastructure/recipes/editor-document.ts";
import type { RecipeEditorOperation } from "../../src/domain/recipes/editor.types.ts";

const recipe = `# Review then publish.
version: 3
name: editor
tasks:
  # Collects the files to review.
  - key: select
    value: [src/a.ts]
  - key: review
    after: [select]
    agent: reviewer
    brief: "Review {{ steps.select.value }} carefully" # inline note
  - key: publish
    after: [select, review]
    when: { ne: [{ $step: review, path: [text] }, ""] }
    command:
      executable: node
      arguments: [-e, "console.log(1)"]
`;

function edit(source: string, operation: RecipeEditorOperation): string {
  const editable = openEditableYaml(source);
  applyDocumentMutations(
    editable,
    planRecipeEdit(editableYamlValue(editable), operation),
  );
  return serializeEditableYaml(editable);
}

function diagnostic(run: () => unknown): ConfigurationError["diagnostic"] {
  try {
    run();
  } catch (error) {
    assert.ok(error instanceof ConfigurationError);
    return error.diagnostic;
  }
  assert.fail("Expected a configuration error");
}

test("the graph projects actions, dependencies and data reads", () => {
  const graph = recipeEditorGraph(editableYamlValue(openEditableYaml(recipe)));
  assert.deepEqual(
    graph.nodes.map(({ id, action, summary, conditional }) => ({
      id,
      action,
      summary,
      conditional,
    })),
    [
      { id: "select", action: "value", summary: "value", conditional: false },
      {
        id: "review",
        action: "agent",
        summary: "reviewer",
        conditional: false,
      },
      {
        id: "publish",
        action: "command",
        summary: "node -e console.log(1)",
        conditional: true,
      },
    ],
  );
  assert.deepEqual(graph.edges, [
    { source: "select", target: "review", kind: "after" },
    { source: "select", target: "publish", kind: "after" },
    { source: "review", target: "publish", kind: "after" },
  ]);
});

test("the graph tolerates invalid drafts and marks undeclared reads", () => {
  const graph = recipeEditorGraph({
    tasks: [
      { key: "a.b", value: 1 },
      { key: "dup", value: 1 },
      { key: "dup", call: { $ref: "functions.x" } },
      "not a task",
      {
        key: "reader",
        value: "{{ steps.a.b.value }}",
        arguments: { $literal: { $step: "dup" } },
        speculation: {},
        loop: {},
      },
    ],
  });
  assert.deepEqual(
    graph.nodes.map((node) => node.id),
    ["a.b", "#1", "#2", "#3", "reader"],
  );
  assert.deepEqual(graph.nodes[2]!.components, ["functions.x"]);
  assert.equal(graph.nodes[4]!.action, undefined);
  assert.deepEqual(graph.nodes[4]!.actions, ["speculation", "value", "loop"]);
  assert.deepEqual(graph.edges, [
    { source: "a.b", target: "reader", kind: "data" },
  ]);
  assert.deepEqual(recipeEditorGraph("text"), { nodes: [], edges: [] });
});

test("renaming a task rewrites dependencies, references and keeps comments", () => {
  const result = edit(recipe, {
    type: "rename-task",
    key: "review",
    to: "inspect",
  });
  assert.equal(
    result,
    recipe
      .replace("key: review", "key: inspect")
      .replace("after: [select, review]", "after: [select, inspect]")
      .replace("$step: review", "$step: inspect"),
  );
  const text = edit(recipe, {
    type: "rename-task",
    key: "select",
    to: "files",
  });
  assert.match(
    text,
    /brief: "Review \{\{ steps\.files\.value \}\} carefully" # inline note/,
  );
  assert.match(text, /# Collects the files to review\.\n {2}- key: files/);
  assert.equal(
    diagnostic(() =>
      planRecipeEdit(editableYamlValue(openEditableYaml(recipe)), {
        type: "rename-task",
        key: "select",
        to: "review",
      }),
    ).code,
    "duplicate-key",
  );
});

test("connecting tasks creates or extends lists and refuses cycles", () => {
  assert.equal(
    edit(recipe, { type: "connect", source: "select", target: "publish" }),
    recipe,
  );
  const created = edit(
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n  - key: b\n    value: 2\n",
    { type: "connect", source: "a", target: "b" },
  );
  assert.equal(
    created,
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n  - key: b\n    value: 2\n    after: [a]\n",
  );
  assert.match(
    edit(recipe, { type: "connect", source: "select", target: "review" }),
    /after: \[select\]\n/,
  );
  assert.match(
    edit(created, { type: "connect", source: "a", target: "b" }),
    /after: \[a\]/,
  );
  const document = editableYamlValue(openEditableYaml(recipe));
  assert.equal(
    diagnostic(() =>
      planRecipeEdit(document, {
        type: "connect",
        source: "publish",
        target: "select",
      }),
    ).code,
    "dependency-cycle",
  );
  assert.deepEqual(
    diagnostic(() =>
      planRecipeEdit(document, { type: "connect", source: "a", target: "a" }),
    ).code,
    "unknown-reference",
  );
});

test("removing and disconnecting tasks cleans their dependency lists", () => {
  const removed = edit(recipe, { type: "remove-task", key: "select" });
  assert.doesNotMatch(removed, /key: select/);
  assert.doesNotMatch(removed, /after: \[select\]/);
  assert.match(removed, /after: \[review\]/);
  assert.match(removed, /- key: review\n {4}agent: reviewer/);
  const disconnected = edit(recipe, {
    type: "disconnect",
    source: "review",
    target: "publish",
  });
  assert.match(disconnected, /after: \[select\]\n {4}when/);
});

test("adding, moving and setting values keeps scalar styles", () => {
  const added = edit(recipe, {
    type: "add-task",
    index: 1,
    task: { key: "lint", command: { executable: "npm", arguments: ["test"] } },
  });
  assert.match(
    added,
    /value: \[src\/a\.ts\]\n {2}- key: lint\n {4}command:\n {6}executable: npm\n {6}arguments:\n {8}- test\n {2}- key: review/,
  );
  const moved = edit(recipe, { type: "move-task", key: "publish", index: 0 });
  assert.deepEqual(
    recipeEditorGraph(editableYamlValue(openEditableYaml(moved))).nodes.map(
      (node) => node.id,
    ),
    ["publish", "select", "review"],
  );
  const set = edit(recipe, {
    type: "set",
    path: ["tasks", 1, "brief"],
    value: "Review again",
  });
  assert.match(set, /brief: "Review again" # inline note/);
  const removed = edit(recipe, { type: "set", path: ["tasks", 2, "when"] });
  assert.doesNotMatch(removed, /when:/);
  assert.equal(
    edit("version: 3\nname: n\n", {
      type: "add-task",
      task: { key: "a", value: 1 },
    }),
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n",
  );
});

test("unchanged recipes serialize byte for byte", () => {
  for (const file of [
    "recipes/review-and-approve.yaml",
    "examples/68-recipe-workflows/recipe.yaml",
    "examples/67-recipe-harness/outpost.yaml",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.equal(serializeEditableYaml(openEditableYaml(source)), source, file);
  }
  const unindented = "tasks:\n- key: a\n  value: { b: [1] }\n";
  assert.equal(serializeEditableYaml(openEditableYaml(unindented)), unindented);
  assert.throws(
    () => openEditableYaml("a: [\n"),
    /Invalid YAML \(line \d+, column \d+\)/,
  );
});

test("version 1 layouts become task positions and follow renamed and removed tasks", () => {
  const layout = recipeEditorLayout({
    version: 1,
    nodes: { a: { x: 1, y: 2 }, b: { x: "3", y: 4 }, c: { x: 5, y: 6 } },
  });
  assert.deepEqual(layout, {
    version: 2,
    nodes: { "task:a": { x: 1, y: 2 }, "task:c": { x: 5, y: 6 } },
  });
  assert.deepEqual(
    updateRecipeEditorLayout(layout, { type: "rename-task", key: "a", to: "z" })
      .nodes,
    { "task:c": { x: 5, y: 6 }, "task:z": { x: 1, y: 2 } },
  );
  assert.deepEqual(
    updateRecipeEditorLayout(layout, { type: "remove-task", key: "c" }).nodes,
    { "task:a": { x: 1, y: 2 } },
  );
  assert.equal(
    updateRecipeEditorLayout(layout, {
      type: "connect",
      source: "a",
      target: "c",
    }),
    layout,
  );
  assert.deepEqual(recipeEditorLayout({ version: 3, nodes: {} }), {
    version: 2,
    nodes: {},
  });
});

test("version 2 layouts keep zone sizes and follow zone and entity renames", () => {
  const layout = recipeEditorLayout({
    version: 2,
    nodes: {
      "zone:sandboxes.a": {
        x: 1,
        y: 2,
        width: 300,
        height: 200,
        collapsed: true,
      },
      "zone:workspace": { x: 0, y: 0, width: -1, height: 10, collapsed: "yes" },
      "entity:agents.coder": { x: 7, y: 8 },
      run: { x: 9, y: 9 },
    },
  });
  assert.deepEqual(layout.nodes["zone:sandboxes.a"], {
    x: 1,
    y: 2,
    width: 300,
    height: 200,
    collapsed: true,
  });
  assert.deepEqual(layout.nodes["zone:workspace"], { x: 0, y: 0 });
  const renamed = updateRecipeEditorSceneLayout(
    updateRecipeEditorSceneLayout(layout, {
      type: "rename-zone",
      zone: "sandboxes.a",
      to: "b",
    }),
    { type: "rename-entity", entity: "agents.coder", to: "writer" },
  );
  assert.deepEqual(Object.keys(renamed.nodes).sort(), [
    "entity:agents.writer",
    "run",
    "zone:sandboxes.b",
    "zone:workspace",
  ]);
  const removed = updateRecipeEditorSceneLayout(
    updateRecipeEditorSceneLayout(renamed, {
      type: "remove-zone",
      zone: "sandboxes.b",
    }),
    { type: "remove-entity", entity: "agents.writer" },
  );
  assert.deepEqual(Object.keys(removed.nodes).sort(), [
    "run",
    "zone:workspace",
  ]);
  assert.equal(
    updateRecipeEditorSceneLayout(layout, {
      type: "place-task",
      key: "a",
      zone: "sandbox",
    }),
    layout,
  );
});
