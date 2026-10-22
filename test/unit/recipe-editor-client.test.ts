import assert from "node:assert/strict";
import { test } from "node:test";
import { validateRecipe } from "../../src/domain/recipe.ts";
import { recipeEditorGraph } from "../../src/domain/recipes/editor.ts";
import {
  diagnosticOffset,
  diagnosticsByTask,
} from "../../editor/src/lib/diagnostics.ts";
import { createEventParser } from "../../editor/src/lib/events.ts";
import { observationText } from "../../editor/src/lib/observation-text.ts";
import { applyRecipeTaskStatus } from "../../src/domain/recipes/run-status.ts";
import type { Observation } from "../../src/domain/observation.types.ts";
import type { TaskStatus } from "../../src/domain/workflow.types.ts";
import {
  arrangeGraph,
  nodeSize,
  placeGraph,
} from "../../editor/src/lib/layout.ts";
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

test("arranged tasks follow dependency depth and survive cycles", () => {
  const graph = recipeEditorGraph({
    version: 3,
    name: "n",
    tasks: [
      { key: "a", value: 1 },
      { key: "b", after: ["a"], value: 1 },
      { key: "c", after: ["a"], value: 1 },
      { key: "d", after: ["b", "c"], value: 1 },
      { key: "x", after: ["y"], value: 1 },
      { key: "y", after: ["x"], value: 1 },
    ],
  });
  const positions = arrangeGraph(graph);
  const column = (key: string) => positions[key]!.x / (positions.b!.x || 1);
  assert.deepEqual(["a", "b", "c", "d"].map(column), [0, 1, 1, 2]);
  assert.notEqual(positions.b!.y, positions.c!.y);
  assert.ok(Number.isFinite(positions.x!.x) && Number.isFinite(positions.y!.x));
});

test("unsaved tasks are placed beside their dependency without overlapping", () => {
  const graph = recipeEditorGraph({
    version: 3,
    name: "n",
    tasks: [
      { key: "a", value: 1 },
      { key: "b", after: ["a"], value: 1 },
      { key: "c", after: ["a"], value: 1 },
      { key: "free", value: 1 },
    ],
  });
  assert.deepEqual(
    placeGraph(graph, { version: 2, nodes: {} }),
    arrangeGraph(graph),
  );
  const placed = placeGraph(graph, {
    version: 2,
    nodes: { "task:a": { x: 100, y: 50 }, "task:gone": { x: 0, y: 0 } },
  });
  assert.deepEqual(placed.a, { x: 100, y: 50 });
  assert.equal(placed.b!.y, 50);
  assert.ok(placed.b!.x > 100 + nodeSize.width);
  assert.equal(placed.c!.x, placed.b!.x);
  assert.ok(placed.c!.y >= 50 + nodeSize.height);
  assert.ok(placed.free!.y > placed.a!.y);
  assert.equal("gone" in placed, false);
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

test("diagnostics are grouped by task and located in the text", () => {
  const located = diagnosticsByTask([
    { file: "recipe", code: "a", message: "a", path: ["tasks", 1, "after", 0] },
    { file: "recipe", code: "b", message: "b", path: ["name"] },
    { file: "config", code: "c", message: "c", path: ["tasks", 1] },
  ]);
  assert.deepEqual([...located.keys()], [1]);
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
