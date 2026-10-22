import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { createRecipeEditorSession } from "../../src/application/recipe-editor/session.ts";
import { recipeEditorRoutes } from "../../src/application/recipe-editor/routes.ts";
import { createRecipeEditorRuns } from "../../src/application/recipe-editor/runs.ts";
import { openEditorRoot } from "../../src/infrastructure/editor-files.ts";
import { serveEditor } from "../../src/infrastructure/editor-server.ts";
import type {
  RecipeEditorRun,
  RecipeEditorRunDetail,
  RecipeEditorRunEvent,
} from "../../src/application/recipe-editor/runs.types.ts";
import type { RecipeEditorState } from "../../src/application/recipe-editor/session.types.ts";

const token = "test-token";

interface Failure {
  readonly error: { readonly message: string };
}

async function editor(t: { after(run: () => Promise<void>): void }) {
  const project = await mkdtemp(join(tmpdir(), "outpost-editor-runs-"));
  const session = createRecipeEditorSession({
    root: await openEditorRoot(project),
  });
  const runs = createRecipeEditorRuns({
    session,
    cli: [process.execPath, resolve("src/cli/main.ts")],
  });
  const events: RecipeEditorRunEvent[] = [];
  runs.subscribe((event) => events.push(event));
  const server = await serveEditor({
    routes: recipeEditorRoutes({ session, version: "0.0.0", runs }),
    token,
  });
  t.after(async () => {
    await runs.close();
    await server.close();
    await rm(project, { recursive: true, force: true });
  });
  async function api<T = Failure>(
    path: string,
    body?: unknown,
  ): Promise<{ status: number; body: T }> {
    const response = await fetch(`${server.url}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: (await response.json()) as T };
  }
  async function settled(id: string): Promise<RecipeEditorRunDetail> {
    for (let attempt = 0; attempt < 600; attempt++) {
      const detail = await api<RecipeEditorRunDetail>(
        `/api/runs/detail?id=${id}`,
      );
      if (detail.body.run.state !== "running") return detail.body;
      await new Promise((done) => setTimeout(done, 100));
    }
    throw new Error(`Run ${id} did not finish`);
  }
  return { project, api, events, settled };
}

test("the editor runs saved drafts and keeps their history out of Git", async (t) => {
  const { project, api, events, settled } = await editor(t);
  const closed = await api("/api/runs", { action: "run" });
  assert.equal(closed.status, 400);
  assert.match(closed.body.error.message, /Open a recipe/);
  await api<RecipeEditorState>("/api/project/open", {
    recipe: "recipe.yaml",
    config: "outpost.yaml",
    starter: "ephemeral",
  });
  const unsaved = await api("/api/runs", { action: "run" });
  assert.match(unsaved.body.error.message, /Save the recipe/);
  await api("/api/project/save", {});

  const started = await api<RecipeEditorRun>("/api/runs", { action: "run" });
  assert.equal(started.status, 200);
  assert.equal(started.body.state, "running");
  assert.equal(started.body.recipe, "recipe.yaml");
  const detail = await settled(started.body.id);
  assert.equal(detail.run.state, "exited");
  assert.equal(detail.run.exitCode, 0);
  assert.equal(detail.run.status, "done");
  assert.deepEqual(detail.run.tasks, { write: "done", read: "done" });
  assert.equal(detail.report?.status, "done");
  assert.ok(
    detail.events.some(
      (item) =>
        item.event.kind === "workflow" && item.event.event.type === "finish",
    ),
  );
  assert.ok(events.some((event) => event.type === "observation"));
  const last = events.filter((event) => event.type === "run").at(-1);
  assert.equal(last?.type === "run" ? last.run.state : undefined, "exited");
  assert.equal(
    await readFile(join(project, ".outpost", "editor", ".gitignore"), "utf8"),
    "*\n",
  );
  const listed = await api<{ runs: RecipeEditorRun[] }>("/api/runs");
  assert.deepEqual(
    listed.body.runs.map((run) => run.id),
    [started.body.id],
  );
  const resume = await api("/api/runs", {
    action: "resume",
    from: started.body.id,
  });
  assert.equal(resume.status, 400);
  assert.match(resume.body.error.message, /no durable run identifier/);
  for (const id of ["../escape", "unknown"]) {
    const missing = await api(`/api/runs/detail?id=${id}`);
    assert.equal(missing.status, 400);
  }
});

test("one run is active at a time and cancelling it lets the CLI clean up", async (t) => {
  const { project, api, events, settled } = await editor(t);
  await writeFile(
    join(project, "recipe.yaml"),
    "version: 3\nname: slow\ntasks:\n  - key: wait\n    command:\n      executable: node\n      arguments: [-e, 'setTimeout(() => {}, 60000)']\n",
  );
  await writeFile(
    join(project, "outpost.yaml"),
    "version: 3\nworkspace: { kind: ephemeral }\nsandbox: { provider: local }\n",
  );
  await api("/api/project/open", {
    recipe: "recipe.yaml",
    config: "outpost.yaml",
  });
  const started = await api<RecipeEditorRun>("/api/runs", { action: "run" });
  const second = await api("/api/runs", { action: "run" });
  assert.equal(second.status, 409);
  for (let attempt = 0; attempt < 300; attempt++) {
    if (
      events.some(
        (event) =>
          event.type === "observation" &&
          event.observation.event.kind === "workflow" &&
          event.observation.event.event.type === "attempt",
      )
    )
      break;
    await new Promise((done) => setTimeout(done, 100));
  }
  const other = await api("/api/runs/cancel", { id: "20260101T000000-000000" });
  assert.equal(other.status, 400);
  const cancelled = await api<RecipeEditorRun>("/api/runs/cancel", {
    id: started.body.id,
  });
  assert.equal(cancelled.status, 200);
  const detail = await settled(started.body.id);
  assert.equal(detail.run.state, "cancelled");
  if (process.platform !== "win32") {
    assert.equal(detail.run.exitCode, 143);
    assert.equal(detail.run.status, "cancelled");
  }
});

test("durable runs pause on unsigned gates and resume with an editor decision", async (t) => {
  const { project, api, settled } = await editor(t);
  await writeFile(
    join(project, "recipe.yaml"),
    [
      "version: 3",
      "name: gated",
      "workflow:",
      "  checkpoint:",
      "    store: { $ref: stores.state }",
      "    runId: gated",
      '    version: "1"',
      "tasks:",
      "  - key: before",
      "    value: ready",
      "  - key: approve",
      "    after: [before]",
      "    gate: { kind: approval, prompt: Ship it?, actors: [owner] }",
      "  - key: after",
      "    after: [approve]",
      "    value: shipped",
      "",
    ].join("\n"),
  );
  await writeFile(
    join(project, "outpost.yaml"),
    [
      "version: 3",
      "workspace: { kind: ephemeral }",
      "sandbox: { provider: local }",
      "transports:",
      "  state: { type: local, directory: ./state }",
      "stores:",
      "  state: { type: transport, transporter: { $ref: transports.state } }",
      "",
    ].join("\n"),
  );
  await api("/api/project/open", {
    recipe: "recipe.yaml",
    config: "outpost.yaml",
  });
  const started = await api<RecipeEditorRun>("/api/runs", { action: "run" });
  const paused = await settled(started.body.id);
  assert.equal(paused.run.status, "paused");
  assert.equal(paused.run.runId, "gated");
  assert.equal(paused.run.tasks.approve, "paused");
  const gate = paused.report?.tasks.find((task) => task.pause);
  assert.ok(gate?.pause && paused.report);

  const status = await api<{ status: unknown }>("/api/runs/status", {
    id: started.body.id,
  });
  assert.equal(status.status, 200);
  assert.notEqual(status.body.status, null);

  const decided = await api<RecipeEditorRun>("/api/runs", {
    action: "decide",
    from: started.body.id,
    decision: {
      executionId: paused.report.executionId,
      key: gate.key,
      requestId: gate.pause.id,
      action: "approve",
      actor: "owner",
      reason: "Checked in the editor",
    },
  });
  assert.equal(decided.status, 200, JSON.stringify(decided.body));
  assert.equal(decided.body.runId, "gated");
  const done = await settled(decided.body.id);
  assert.equal(done.run.status, "done");
  assert.deepEqual(done.run.tasks, {
    before: "done",
    approve: "done",
    after: "done",
  });
  const decision = join(
    project,
    ".outpost",
    "editor",
    "runs",
    decided.body.id,
    "decision.json",
  );
  assert.equal(JSON.parse(await readFile(decision, "utf8")).actor, "owner");
  if (process.platform !== "win32")
    assert.equal((await stat(decision)).mode & 0o777, 0o600);
});
