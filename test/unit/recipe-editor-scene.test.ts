import assert from "node:assert/strict";
import { test } from "node:test";
import {
  recipeEditorFeaturePath,
  recipeEditorPlacement,
  recipeEditorScene,
  recipeEditorSceneNode,
} from "../../src/domain/recipes/editor-scene.ts";
import { recipeEditorCompatibility } from "../../src/application/recipe-editor/compatibility.ts";

const configuration = {
  version: 3,
  workspace: {
    kind: "git",
    repository: "./project",
    branch: { mode: "named", name: "app" },
  },
  sandbox: { provider: "local" },
  workspaces: { docs: { kind: "git", repository: "./project" } },
  sandboxes: {
    builder: { provider: "docker", image: "node:24", volumes: [] },
    writer: {
      workspace: { $ref: "workspaces.docs" },
      provider: "podman",
      variables: { ZONE: "docs" },
    },
  },
  agents: { coder: { harness: "codex", authentication: "account" } },
  transports: { state: { type: "local", directory: "./state" } },
  stores: {
    checkpoint: {
      type: "transport",
      transporter: { $ref: "transports.state" },
    },
  },
  environment: { TOKEN: "TOKEN" },
};

const recipe = {
  version: 3,
  name: "scene",
  workflow: {
    concurrency: 2,
    checkpoint: { store: { $ref: "stores.checkpoint" }, runId: "default" },
  },
  tasks: [
    { key: "build", command: { executable: "make" }, sandbox: "builder" },
    { key: "lint", command: { executable: "lint" } },
    { key: "write", agent: "coder", sandbox: "writer", after: ["build"] },
    { key: "approve", gate: { kind: "approval" }, after: ["write"] },
  ],
};

const compatibility = recipeEditorCompatibility();

test("a recipe and its configuration project into nested zones, placed tasks and entities", () => {
  const scene = recipeEditorScene(recipe, configuration);
  assert.deepEqual(
    scene.zones.map((zone) => [zone.id, zone.parent, zone.type, zone.mode]),
    [
      ["workspace", undefined, "git", "git"],
      ["workspaces.docs", undefined, "git", "git"],
      ["sandbox", "workspace", "local", undefined],
      ["sandboxes.builder", "workspace", "docker", undefined],
      ["sandboxes.writer", "workspaces.docs", "podman", undefined],
    ],
  );
  assert.deepEqual(scene.zones[0]?.features, ["branch"]);
  assert.deepEqual(scene.zones[3]?.features, ["volumes"]);
  assert.deepEqual(scene.zones[4]?.features, ["variables"]);
  assert.ok(scene.zones.every((zone) => zone.declared));
  assert.deepEqual(
    scene.tasks.map((task) => [task.id, task.zone]),
    [
      ["build", "sandboxes.builder"],
      ["lint", "sandbox"],
      ["write", "sandboxes.writer"],
      ["approve", undefined],
    ],
  );
  assert.deepEqual(
    scene.entities.map((entity) => [entity.id, entity.kind, entity.type]),
    [
      ["agents.coder", "agent", "codex"],
      ["transports.state", "transport", "local"],
      ["stores.checkpoint", "checkpointStore", "transport"],
    ],
  );
  assert.deepEqual(scene.references, [
    { source: "task:write", target: "agents.coder", field: "agent" },
    {
      source: "entity:stores.checkpoint",
      target: "transports.state",
      field: "transporter",
    },
    { source: "run", target: "stores.checkpoint", field: "checkpoint.store" },
  ]);
  assert.deepEqual(scene.run, {
    options: ["concurrency", "checkpoint"],
    environment: ["TOKEN"],
  });
  assert.deepEqual(
    scene.edges.map((edge) => [edge.source, edge.target]),
    [
      ["build", "write"],
      ["write", "approve"],
    ],
  );
});

test("file configurations keep the configuration workspace outputs at the root and imply undeclared zones", () => {
  const scene = recipeEditorScene(
    {
      version: 3,
      name: "files",
      tasks: [{ key: "draft", command: { executable: "true" } }],
    },
    {
      version: 3,
      outputs: [{ paths: ["a"], destination: "./out", policy: "create" }],
      workspaces: {
        scratch: {
          kind: "ephemeral",
          retention: { policy: "local" },
          outputs: [],
        },
      },
    },
  );
  const [main, scratch, sandbox] = scene.zones;
  assert.equal(main?.declared, false);
  assert.equal(main?.type, undefined);
  assert.deepEqual(main?.features, ["outputs"]);
  assert.deepEqual(scratch?.features, ["outputs", "retention"]);
  assert.equal(scratch?.mode, "files");
  assert.equal(sandbox?.declared, false);
  assert.deepEqual(recipeEditorFeaturePath(main!, "outputs"), ["outputs"]);
  assert.deepEqual(recipeEditorFeaturePath(scratch!, "outputs"), [
    "workspaces",
    "scratch",
    "outputs",
  ]);
  assert.deepEqual(recipeEditorScene(undefined, undefined).zones, []);
});

test("placement keeps executing tasks in sandboxes, sandboxes in workspaces and features where they apply", () => {
  const scene = recipeEditorScene(recipe, configuration);
  const place = (
    item: Parameters<typeof recipeEditorPlacement>[2],
    zone?: string,
  ) =>
    recipeEditorPlacement(
      scene,
      compatibility,
      item,
      zone ? { type: "zone", id: zone } : { type: "root" },
    );
  const task = (id: string) => ({ type: "task", id }) as const;
  const zone = (id: string) => ({ type: "zone", id }) as const;
  const feature = (name: "outputs" | "volumes" | "variables" | "branch") =>
    ({ type: "feature", feature: name }) as const;
  assert.deepEqual(place(task("build"), "sandboxes.writer"), { allowed: true });
  assert.deepEqual(place(task("build")), {
    allowed: false,
    reason: "Command and agent tasks run in a sandbox zone",
  });
  assert.equal(place(task("build"), "workspace").allowed, false);
  assert.deepEqual(place(task("approve")), { allowed: true });
  assert.deepEqual(place(task("approve"), "sandbox"), {
    allowed: false,
    reason:
      "Only command and agent tasks run in a sandbox; keep this task outside zones",
  });
  assert.deepEqual(place(zone("sandboxes.builder"), "workspaces.docs"), {
    allowed: true,
  });
  assert.equal(place(zone("sandbox"), "workspaces.docs").allowed, false);
  assert.equal(place(zone("sandboxes.builder")).allowed, false);
  assert.equal(place(zone("workspaces.docs"), "workspace").allowed, false);
  assert.deepEqual(place(zone("workspaces.docs")), { allowed: true });
  assert.deepEqual(place(feature("outputs"), "workspaces.docs"), {
    allowed: false,
    reason: "outputs requires a files workspace",
  });
  assert.deepEqual(place(feature("branch"), "workspaces.docs"), {
    allowed: true,
  });
  assert.equal(place(feature("branch"), "workspace").allowed, false);
  assert.deepEqual(place(feature("volumes"), "sandbox"), {
    allowed: false,
    reason: "Sandbox provider local does not accept volumes",
  });
  assert.deepEqual(place(feature("volumes"), "sandboxes.writer"), {
    allowed: true,
  });
  assert.equal(place(feature("variables"), "workspace").allowed, false);
  assert.equal(place(task("missing")).allowed, false);
  assert.deepEqual(place({ type: "action", action: "agent" }, "sandbox"), {
    allowed: true,
  });
  assert.deepEqual(place({ type: "action", action: "isolated" }, "sandbox"), {
    allowed: false,
    reason: "Isolated tasks open their own workspace and sandbox",
  });
  assert.deepEqual(place({ type: "action", action: "gate" }), {
    allowed: true,
  });
  assert.deepEqual(place({ type: "new-zone", kind: "sandbox" }, "sandbox"), {
    allowed: false,
    reason: "A sandbox opens a workspace; drop it in a workspace zone",
  });
  assert.deepEqual(
    place({ type: "new-zone", kind: "sandbox" }, "workspaces.docs"),
    { allowed: true },
  );
  assert.equal(
    place({ type: "new-zone", kind: "workspace" }, "workspace").allowed,
    false,
  );
  assert.equal(place(task("build"), "sandboxes.missing").allowed, false);
});

test("the compatibility map reads provider features and family types from the registry", () => {
  assert.deepEqual(compatibility.providers.docker, [
    "variables",
    "egress",
    "caches",
    "volumes",
  ]);
  assert.deepEqual(compatibility.providers.local, ["variables"]);
  assert.equal(compatibility.families.stores?.kind, "checkpointStore");
  assert.ok(compatibility.families.agents?.types.includes("composed"));
});

test("diagnostics are attached to the task, zone, entity or run their path designates", () => {
  const scene = recipeEditorScene(recipe, configuration);
  const node = (
    file: "recipe" | "config" | "layout",
    ...path: (string | number)[]
  ) => recipeEditorSceneNode(scene, file, path);
  assert.equal(node("recipe", "tasks", 2, "agent"), "task:write");
  assert.equal(node("recipe", "workflow", "concurrency"), "run");
  assert.equal(node("recipe", "tasks", 9), undefined);
  assert.equal(node("recipe", "name"), undefined);
  assert.equal(node("config", "workspace", "branch"), "zone:workspace");
  assert.equal(node("config", "outputs", 0), "zone:workspace");
  assert.equal(node("config", "workspaces", "docs"), "zone:workspaces.docs");
  assert.equal(
    node("config", "sandboxes", "writer", "provider"),
    "zone:sandboxes.writer",
  );
  assert.equal(node("config", "sandbox"), "zone:sandbox");
  assert.equal(
    node("config", "stores", "checkpoint"),
    "entity:stores.checkpoint",
  );
  assert.equal(node("config", "environment", "TOKEN"), "run");
  assert.equal(node("config", "version"), undefined);
  assert.equal(node("layout", "nodes"), undefined);
});
