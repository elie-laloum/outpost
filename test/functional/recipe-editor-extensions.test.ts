import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { createRecipeEditorSession } from "../../src/application/recipe-editor/session.ts";
import { recipeEditorRoutes } from "../../src/application/recipe-editor/routes.ts";
import {
  recipeEditorContracts,
  recipeEditorExtensionKinds,
  recipeEditorModulePath,
} from "../../src/application/recipe-editor/extensions.ts";
import { openEditorRoot } from "../../src/infrastructure/editor-files.ts";
import { serveEditor } from "../../src/infrastructure/editor-server.ts";
import type {
  RecipeEditorExtension,
  RecipeEditorExtensionCreation,
  RecipeEditorVerification,
} from "../../src/application/recipe-editor/extensions.types.ts";
import type { RecipeEditorState } from "../../src/application/recipe-editor/session.types.ts";
import type { EditorFile } from "../../src/infrastructure/editor-files.types.ts";

const token = "test-token";

interface Failure {
  readonly error: {
    readonly message: string;
    readonly diagnostic?: { readonly code: string };
  };
}

async function editor(t: { after(run: () => Promise<void>): void }) {
  const project = await mkdtemp(join(tmpdir(), "outpost-editor-extensions-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  const session = createRecipeEditorSession({
    root: await openEditorRoot(project),
  });
  const server = await serveEditor({
    routes: recipeEditorRoutes({
      session,
      version: "0.0.0",
      cli: [process.execPath, resolve("src/cli/main.ts")],
    }),
    token,
  });
  t.after(() => server.close());
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
  return { project, api };
}

test("extension contracts come from the native schemas, common ones first", () => {
  const contracts = recipeEditorContracts();
  assert.deepEqual(contracts[0], {
    kind: "callback",
    contract: "call.options.perform",
  });
  assert.ok(contracts.every((item) => item.kind === "callback"));
  const kinds = recipeEditorExtensionKinds();
  assert.equal(kinds[0], "callback");
  assert.ok(kinds.includes("sink") && kinds.includes("queue"));
  assert.equal(
    new Set(contracts.map((item) => `${item.kind} ${item.contract}`)).size,
    contracts.length,
  );
  assert.equal(
    recipeEditorModulePath("config/outpost.yaml", "./steps.ts"),
    "config/steps.ts",
  );
  assert.equal(
    recipeEditorModulePath("outpost.yaml", "../outside.ts"),
    undefined,
  );
  assert.equal(
    recipeEditorModulePath("outpost.yaml", "some-package"),
    undefined,
  );
});

test("the editor declares extensions, edits their modules and verifies them in a child process", async (t) => {
  const { project, api } = await editor(t);
  const refused = await api("/api/extensions", {
    name: "summary",
    kind: "callback",
    module: "./steps.ts",
    export: "summary",
    revision: 0,
  });
  assert.equal(refused.status, 400);
  let state = (
    await api<RecipeEditorState>("/api/project/open", {
      recipe: "recipe.yaml",
      config: "outpost.yaml",
      starter: "ephemeral",
    })
  ).body;
  const created = await api<RecipeEditorExtensionCreation>("/api/extensions", {
    name: "summary",
    kind: "callback",
    contract: "call.options.perform",
    module: "./steps.ts",
    export: "summary",
    function: "summary",
    revision: state.revision,
  });
  assert.equal(created.status, 200);
  assert.equal(created.body.path, "steps.ts");
  assert.equal(created.body.created, true);
  assert.match(
    await readFile(join(project, "steps.ts"), "utf8"),
    /export async function summary/,
  );
  state = created.body.state;
  assert.equal(state.config?.dirty, true);
  assert.match(state.config?.text ?? "", /\$ref: extensions\.summary/);

  for (const [request, code] of [
    [
      { name: "summary", module: "./steps.ts", export: "summary" },
      "duplicate-key",
    ],
    [
      { name: "other", module: "./steps.txt", export: "other" },
      "invalid-value",
    ],
    [
      { name: "other", module: "../steps.ts", export: "other" },
      "invalid-value",
    ],
    [
      { name: "other", module: "./steps.ts", export: "not-valid" },
      "invalid-value",
    ],
  ] as const) {
    const failed = await api("/api/extensions", {
      ...request,
      kind: "callback",
      revision: state.revision,
    });
    assert.equal(failed.status, 422, JSON.stringify(failed.body));
    assert.equal(failed.body.error.diagnostic?.code, code);
  }

  const listed = await api<{
    extensions: readonly RecipeEditorExtension[];
  }>("/api/extensions");
  assert.deepEqual(listed.body.extensions, [
    {
      name: "summary",
      module: "./steps.ts",
      export: "summary",
      kind: "callback",
      contract: "call.options.perform",
      version: "1",
      path: "steps.ts",
      exists: true,
      functions: ["summary"],
    },
  ]);

  const unsaved = await api("/api/extensions/verify", {});
  assert.equal(unsaved.status, 400);
  assert.match(unsaved.body.error.message, /Save the recipe/);
  await api("/api/project/save", {});

  const module = await api<EditorFile>("/api/modules?path=steps.ts");
  const broken = await api<EditorFile>("/api/modules", {
    path: "steps.ts",
    text: "export const other = 1;\n",
    hash: module.body.hash,
  });
  assert.equal(broken.status, 200);
  const stale = await api("/api/modules", {
    path: "steps.ts",
    text: "export const summary = () => 1;\n",
    hash: module.body.hash,
  });
  assert.equal(stale.status, 409);
  const failing = await api<RecipeEditorVerification>(
    "/api/extensions/verify",
    {},
  );
  assert.equal(failing.body.ok, false);
  assert.match(failing.body.message ?? "", /summary/);

  await api("/api/modules", {
    path: "steps.ts",
    text: "export const summary = async (value: unknown) => value;\n",
    hash: broken.body.hash,
  });
  const verified = await api<RecipeEditorVerification>(
    "/api/extensions/verify",
    {},
  );
  assert.deepEqual(verified.body, {
    ok: true,
    extensions: ["extensions.summary"],
  });

  const existing = await api<RecipeEditorExtensionCreation>("/api/extensions", {
    name: "again",
    kind: "callback",
    module: "./steps.ts",
    export: "summary",
    revision: (await api<RecipeEditorState>("/api/project")).body.revision,
  });
  assert.equal(existing.body.created, false);
  assert.match(
    await readFile(join(project, "steps.ts"), "utf8"),
    /export const summary = async/,
  );

  await writeFile(join(project, "notes.md"), "secret");
  const outside = await api("/api/modules?path=notes.md");
  assert.equal(outside.status, 400);
  const escape = await api("/api/modules?path=../escape.ts");
  assert.equal(escape.status, 400);
});
