import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { validateRecipe } from "../../src/domain/recipe.ts";
import {
  diagnosticOffset,
  diagnosticsByNode,
} from "../../editor/src/lib/diagnostics.ts";
import { createEventParser } from "../../editor/src/lib/events.ts";
import { observationText } from "../../editor/src/lib/observation-text.ts";
import { applyRecipeTaskStatus } from "../../src/domain/recipes/run-status.ts";
import type { Observation } from "../../src/domain/observation.types.ts";
import type { TaskStatus } from "../../src/domain/workflow.types.ts";
import {
  type ScenePlace,
  absolutePosition,
  layoutEntries,
  nodeSize,
  placeScene,
  uniqueName,
  zoneAt,
  zoneFrame,
} from "../../editor/src/lib/scene-layout.ts";
import { componentName } from "../../editor/src/lib/scene-templates.ts";
import { zoneRuns } from "../../editor/src/lib/zone-runs.ts";
import {
  type JsonSchema,
  constantOf,
  documentSchema,
  fieldKind,
  schemaAt,
  schemaChoice,
  schemaProperties,
  schemaVariant,
} from "../../editor/src/lib/schema.ts";
import { recipeEditorGraph } from "../../src/domain/recipes/editor.ts";
import { recipeEditorScene } from "../../src/domain/recipes/editor-scene.ts";
import {
  configurationNames,
  taskTemplates,
  uniqueTaskKey,
} from "../../editor/src/lib/templates.ts";

test("the event parser joins chunks, data lines and named events", () => {
  const events: [string, string][] = [];
  const parse = createEventParser((event, data) => events.push([event, data]));
  parse('retry: 1000\n\n: heartbeat\n\nevent: state\r\ndata: {"a":');
  parse("1}\n\ndata: one\ndata: two\n\n");
  parse("event: empty\n\n");
  assert.deepEqual(events, [
    ["state", '{"a":1}'],
    ["message", "one\ntwo"],
  ]);
});

const zoned = recipeEditorScene(
  {
    version: 3,
    name: "zones",
    tasks: [
      { key: "a", command: { executable: "a" } },
      { key: "b", after: ["a"], command: { executable: "b" } },
      { key: "c", after: ["a"], command: { executable: "c" } },
      { key: "d", after: ["b", "c"], command: { executable: "d" } },
      { key: "docs", command: { executable: "d" }, sandbox: "writer" },
      { key: "gate", after: ["d"], gate: { kind: "approval" } },
      { key: "x", after: ["y"], value: 1 },
      { key: "y", after: ["x"], value: 1 },
    ],
  },
  {
    version: 3,
    workspace: { kind: "ephemeral" },
    sandbox: { provider: "local" },
    workspaces: { notes: { kind: "ephemeral" } },
    sandboxes: {
      writer: { workspace: { $ref: "workspaces.notes" }, provider: "local" },
      stray: { workspace: { $ref: "workspaces.missing" }, provider: "local" },
    },
    agents: { coder: { harness: "codex", authentication: "account" } },
  },
);

function overlap(a: ScenePlace, b: ScenePlace): boolean {
  return (
    a.position.x < b.position.x + b.size.width &&
    b.position.x < a.position.x + a.size.width &&
    a.position.y < b.position.y + b.size.height &&
    b.position.y < a.position.y + a.size.height
  );
}

function siblings(places: Record<string, ScenePlace>) {
  const groups = new Map<string, ScenePlace[]>();
  for (const place of Object.values(places))
    groups.set(place.parent ?? "", [
      ...(groups.get(place.parent ?? "") ?? []),
      place,
    ]);
  return [...groups.values()];
}

test("the scene layout nests tasks in sandboxes and sandboxes in workspaces, sized to fit", () => {
  const places = placeScene(zoned, { version: 2, nodes: {} });
  assert.equal(places["task:a"]?.parent, "zone:sandbox");
  assert.equal(places["task:docs"]?.parent, "zone:sandboxes.writer");
  assert.equal(places["zone:sandbox"]?.parent, "zone:workspace");
  assert.equal(
    places["zone:sandboxes.writer"]?.parent,
    "zone:workspaces.notes",
  );
  for (const id of ["zone:workspace", "zone:sandboxes.stray", "task:gate"])
    assert.equal(places[id]?.parent, undefined, id);
  assert.ok(places.run && places["entity:agents.coder"]);
  const column = (key: string) => places[`task:${key}`]!.position.x;
  assert.deepEqual(
    ["a", "b", "d"].map(column).map((x) => x - column("a")),
    [0, nodeSize.width + 72, 2 * (nodeSize.width + 72)],
  );
  assert.equal(column("b"), column("c"));
  assert.ok(places["task:a"]!.position.x >= zoneFrame.padding);
  assert.ok(places["task:a"]!.position.y >= zoneFrame.header);
  for (const [id, place] of Object.entries(places)) {
    if (!place.parent) continue;
    const parent = places[place.parent]!;
    assert.ok(
      place.position.x + place.size.width <= parent.size.width &&
        place.position.y + place.size.height <= parent.size.height,
      `${id} fits in ${place.parent}`,
    );
  }
  for (const group of siblings(places))
    group.forEach((place, index) =>
      group
        .slice(index + 1)
        .forEach((other) => assert.equal(overlap(place, other), false)),
    );
  assert.ok(Number.isFinite(places["task:x"]!.position.x));
});

test("saved positions and sizes win, collapsed zones hide their contents and drops find the innermost zone", () => {
  const layout = {
    version: 2,
    nodes: {
      "task:a": { x: 40, y: 80 },
      "zone:sandbox": { x: 30, y: 60, width: 2000, height: 900 },
      "zone:workspaces.notes": { x: 0, y: 1400, collapsed: true },
    },
  } as const;
  const places = placeScene(zoned, layout);
  assert.deepEqual(places["task:a"]!.position, { x: 40, y: 80 });
  assert.equal(places["task:b"]!.position.y, 80);
  assert.ok(places["task:b"]!.position.x > 40 + nodeSize.width);
  assert.ok(places["task:c"]!.position.y >= 80 + nodeSize.height);
  assert.deepEqual(places["zone:sandbox"]!.size, { width: 2000, height: 900 });
  assert.ok(places["zone:sandbox"]!.minimum!.width < 2000);
  assert.equal(places["zone:workspaces.notes"]!.size.height, zoneFrame.header);
  assert.equal(places["zone:sandboxes.writer"]!.hidden, true);
  assert.equal(places["task:docs"]!.hidden, true);
  const sandbox = absolutePosition(places, "zone:sandbox");
  const workspace = absolutePosition(places, "zone:workspace");
  assert.deepEqual(sandbox, {
    x: workspace.x + 30,
    y: workspace.y + 60,
  });
  const inside = { x: sandbox.x + 10, y: sandbox.y + 10 };
  assert.equal(zoneAt(zoned, places, inside)?.id, "sandbox");
  assert.equal(zoneAt(zoned, places, inside, ["workspace"])?.id, "workspace");
  assert.equal(
    zoneAt(zoned, places, inside, undefined, new Set(["zone:sandbox"]))?.id,
    "workspace",
  );
  assert.equal(zoneAt(zoned, places, { x: -9999, y: -9999 }), undefined);
  const notes = absolutePosition(places, "zone:workspaces.notes");
  assert.equal(
    zoneAt(zoned, places, { x: notes.x + 40, y: notes.y + 60 }),
    undefined,
    "a collapsed zone keeps only its header",
  );
  const entries = layoutEntries(places, layout, { "task:a": { x: 1.6, y: 2 } });
  assert.deepEqual(entries["task:a"], { x: 2, y: 2 });
  assert.deepEqual(entries["zone:sandbox"], {
    x: 30,
    y: 60,
    width: 2000,
    height: 900,
  });
  assert.equal(entries["zone:workspaces.notes"]?.collapsed, true);
  const arranged = placeScene(zoned, layout, true);
  assert.notDeepEqual(arranged["task:a"]!.position, { x: 40, y: 80 });
  assert.ok(arranged["zone:sandbox"]!.size.width < 2000);
  assert.equal(arranged["zone:workspaces.notes"]!.collapsed, true);
  const grown = placeScene(zoned, {
    version: 2,
    nodes: {
      "zone:workspace": { x: 300, y: 0, width: 900, height: 700 },
      "zone:workspaces.notes": { x: 300, y: 100 },
    },
  });
  assert.ok(
    grown["zone:workspaces.notes"]!.position.y >= 700,
    "a grown zone pushes the zone it would cover",
  );
  assert.equal(uniqueName("docker", ["docker", "docker-2"]), "docker-3");
  assert.equal(uniqueName("git", []), "git");
  assert.equal(componentName("agents"), "agent");
  assert.equal(componentName("policies"), "policy");
});

test("every task template has a unique key and the standalone ones validate", () => {
  const names = configurationNames({
    agents: { reviewer: {} },
    functions: { summary: {} },
    sandbox: { provider: "local" },
  });
  assert.deepEqual(names, { agents: ["reviewer"], functions: ["summary"] });
  assert.deepEqual(configurationNames("invalid"), {
    agents: [],
    functions: [],
  });
  const tasks = Object.entries(taskTemplates).map(
    ([action, template], index, all) => ({
      key: uniqueTaskKey(
        action,
        all.slice(0, index).map(([key]) => key),
      ),
      ...template.body(names),
    }),
  );
  const graph = recipeEditorGraph({ version: 3, name: "all", tasks });
  assert.deepEqual(
    graph.nodes.map((node) => node.action),
    Object.keys(taskTemplates),
  );
  const standalone = ["command", "agent", "value", "gate"].map((action) => ({
    key: action,
    ...taskTemplates[action as keyof typeof taskTemplates].body(names),
  }));
  assert.doesNotThrow(() =>
    validateRecipe({ version: 3, name: "ok", tasks: standalone }),
  );
  assert.equal(uniqueTaskKey("gate", ["gate", "gate-2"]), "gate-3");
});

test("diagnostics are grouped by scene node and located in the text", () => {
  const located = diagnosticsByNode([
    {
      file: "recipe",
      code: "a",
      message: "a",
      path: ["tasks", 1, "after", 0],
      node: "task:b",
    },
    { file: "recipe", code: "b", message: "b", path: ["name"] },
    {
      file: "config",
      code: "c",
      message: "c",
      path: ["sandbox"],
      node: "zone:sandbox",
    },
    {
      file: "config",
      code: "d",
      message: "d",
      path: ["sandbox", "image"],
      node: "zone:sandbox",
    },
  ]);
  assert.deepEqual(
    [...located].map(([node, items]) => [node, items.length]),
    [
      ["task:b", 1],
      ["zone:sandbox", 2],
    ],
  );
  const text = "first\nsecond\nthird";
  assert.equal(diagnosticOffset(text, 2, 3), "first\nse".length);
  assert.equal(diagnosticOffset(text, 9, 99), text.length);
  assert.equal(diagnosticOffset(text, undefined, undefined), 0);
});

test("run observations become log lines and live task statuses", () => {
  const observation = (event: Observation["event"]): Observation => ({
    seq: 1,
    at: "2026-10-22T12:00:00.000Z",
    source: "workflow",
    scope: {},
    event,
  });
  const workflow = (event: Record<string, unknown>) =>
    observation({
      kind: "workflow",
      event: {
        executionId: "e",
        workflow: "w",
        timestamp: "2026-10-22T12:00:00.000Z",
        type: "task",
        ...event,
      },
    } as Observation["event"]);
  assert.equal(
    observationText(
      workflow({ key: "build", status: "failed", error: "boom" }),
    ),
    "task build → failed: boom",
  );
  assert.equal(observationText(workflow({ type: "checkpoint" })), undefined);
  assert.equal(
    observationText(
      observation({ kind: "command-output", channel: "stdout", text: "ok\n" }),
    ),
    "ok",
  );
  assert.equal(
    observationText(observation({ kind: "text-delta", text: "o" })),
    undefined,
  );
  assert.equal(
    observationText(observation({ kind: "warning", message: "slow" })),
    "warning: slow",
  );
  const tasks: Record<string, TaskStatus> = {};
  assert.equal(
    applyRecipeTaskStatus(tasks, workflow({ key: "build", status: "active" })),
    true,
  );
  applyRecipeTaskStatus(
    tasks,
    workflow({
      type: "finish",
      tasks: [
        { key: "build", status: "done", attempts: 1 },
        { key: "ship", status: "skipped", attempts: 0 },
      ],
    }),
  );
  assert.deepEqual(tasks, { build: "done", ship: "skipped" });
  assert.equal(
    applyRecipeTaskStatus(
      tasks,
      observation({ kind: "warning", message: "slow" }),
    ),
    false,
  );
});

test("schema forms follow the configuration schema through maps, variants and references", async () => {
  const root = JSON.parse(
    await readFile("recipe-configuration.schema.json", "utf8"),
  ) as JsonSchema;
  const document = documentSchema(root);
  assert.ok(document);
  const box = schemaAt(root, document, ["sandboxes", "box"]);
  const sandbox = schemaChoice(root, box, { provider: "docker" });
  assert.equal(sandbox.discriminator, "provider");
  assert.equal(schemaChoice(root, box).discriminator, "type");
  assert.ok(sandbox.reference);
  const docker = schemaVariant(root, sandbox, {
    provider: "docker",
    image: "node:24",
  });
  assert.equal(constantOf(root, schemaProperties(docker!).provider), "docker");
  const field = (name: string) =>
    fieldKind(root, schemaProperties(docker!)[name]);
  assert.deepEqual(field("image"), { kind: "text" });
  assert.equal(field("volumes").kind, "yaml");
  assert.equal(field("egress").kind, "object");
  assert.equal(
    schemaVariant(root, sandbox, { $ref: "sandboxProviders.box" }),
    sandbox.reference,
  );
  const workspace = schemaChoice(root, schemaAt(root, document, ["workspace"]));
  assert.equal(workspace.discriminator, "kind");
  const retention = schemaAt(root, document, [
    "workspaces",
    "notes",
    "retention",
  ]);
  assert.equal(schemaChoice(root, retention).discriminator, "policy");
  assert.deepEqual(
    fieldKind(
      root,
      schemaAt(root, document, ["workspaces", "notes", "retention", "policy"]),
    ),
    { kind: "choice", choices: ["run", "local"] },
  );
  const agents = schemaChoice(root, schemaAt(root, document, ["agents", "a"]));
  const coder = schemaVariant(root, agents, {
    harness: "codex",
    authentication: "account",
  });
  assert.ok(schemaProperties(coder!).harness);
  assert.equal(
    constantOf(
      root,
      schemaProperties(
        schemaVariant(root, agents, { type: "fallback", agents: [], on: [] })!,
      ).type,
    ),
    "fallback",
  );
  assert.equal(schemaAt(root, document, ["unknown", "x"]), undefined);
  assert.deepEqual(
    fieldKind(root, { type: "array", items: { type: "string" } }),
    {
      kind: "list",
    },
  );
  assert.deepEqual(
    fieldKind(root, { anyOf: [{ const: false }, { const: true }] }),
    {
      kind: "boolean",
    },
  );
  assert.deepEqual(fieldKind(root, { type: "integer" }), { kind: "number" });
  assert.deepEqual(fieldKind(root, {}), { kind: "yaml" });
});

test("zone runs gather the statuses of their tasks and the workspace reports", () => {
  const runs = zoneRuns(
    zoned,
    {
      a: "done",
      b: "done",
      c: "active",
      docs: "failed",
      gate: "waiting-input",
    },
    {
      name: "zones",
      status: "failed",
      tasks: [],
      outputs: {},
      errors: [],
      fileOutputs: [],
      workspaces: {
        notes: {
          kind: "files",
          fileOutputs: [
            {
              id: "p",
              destination: "./out",
              state: "complete",
              created: [],
              replaced: [],
              deleted: [],
              reference: { kind: "local", key: "k" } as never,
            },
          ],
        },
      },
    },
  );
  assert.deepEqual(runs.sandbox, {
    status: "active",
    finished: 2,
    total: 4,
    details: [],
  });
  assert.deepEqual(runs.workspace, {
    status: "active",
    finished: 2,
    total: 4,
    details: ["0 publications"],
  });
  assert.equal(runs["workspaces.notes"]?.status, "failed");
  assert.deepEqual(runs["workspaces.notes"]?.details, ["1 publication"]);
  assert.deepEqual(runs["sandboxes.stray"], {
    finished: 0,
    total: 0,
    details: [],
  });
  const finished = zoneRuns(
    zoned,
    { a: "done", b: "skipped", c: "done", d: "done" },
    {
      name: "zones",
      status: "done",
      tasks: [],
      outputs: {},
      errors: [],
      workspace: {
        branch: "main",
        directory: "/w",
        retainedDirectory: "/kept",
      },
    },
  );
  assert.equal(finished.sandbox?.status, "done");
  assert.deepEqual(finished.workspace?.details, [
    "branch main",
    "kept in /kept",
  ]);
  assert.equal(zoneRuns(zoned, {}).workspace?.status, undefined);
});
