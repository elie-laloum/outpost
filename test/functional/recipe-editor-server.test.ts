import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { test } from "node:test";
import { createRecipeEditorSession } from "../../src/application/recipe-editor/session.ts";
import { recipeEditorRoutes } from "../../src/application/recipe-editor/routes.ts";
import { openEditorRoot } from "../../src/infrastructure/editor-files.ts";
import { serveEditor } from "../../src/infrastructure/editor-server.ts";
import type { RecipeEditorState } from "../../src/application/recipe-editor/session.types.ts";

const token = "test-token";

interface Failure {
  readonly error: {
    readonly message: string;
    readonly diagnostic: { readonly code: string };
    readonly details: { readonly files: readonly string[] };
  };
}

async function editor(t: { after(run: () => Promise<void>): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-editor-server-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const assets = join(directory, "assets-root");
  await mkdir(join(assets, "assets"), { recursive: true });
  await writeFile(
    join(assets, "index.html"),
    "<html><script>window.boot=1</script><script src=/assets/app.js></script></html>",
  );
  await writeFile(join(assets, "assets", "app.js"), "console.log(1)");
  await writeFile(join(directory, "secret.txt"), "not served");
  const project = join(directory, "project");
  await mkdir(project);
  const session = createRecipeEditorSession({
    root: await openEditorRoot(project),
  });
  const server = await serveEditor({
    routes: recipeEditorRoutes({
      session,
      version: "0.0.0",
      diskPollMs: 50,
      schemas: {
        recipe: resolve("recipe.schema.json"),
        configuration: resolve("recipe-configuration.schema.json"),
      },
    }),
    token,
    assets,
  });
  t.after(() => server.close());
  async function api<T = Failure>(
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ): Promise<{ status: number; body: T }> {
    const response = await fetch(`${server.url}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: (await response.json()) as T };
  }
  return { directory, project, server, api };
}

function raw(
  port: number,
  path: string,
  headers: Record<string, string>,
): Promise<number> {
  return new Promise((done, reject) => {
    const request = httpRequest(
      { host: "127.0.0.1", port, path, headers },
      (response) => {
        response.resume();
        done(response.statusCode ?? 0);
      },
    );
    request.once("error", reject);
    request.end();
  });
}

test("the editor API refuses foreign hosts, origins and missing tokens", async (t) => {
  const { server, api } = await editor(t);
  assert.equal((await fetch(`${server.url}/api/project`)).status, 401);
  assert.equal(
    (await api("/api/project", undefined, { origin: "http://evil.test" }))
      .status,
    403,
  );
  assert.equal(
    await raw(server.port, "/api/project", {
      host: `rebound.test:${server.port}`,
      authorization: `Bearer ${token}`,
    }),
    403,
  );
  assert.equal(
    await raw(server.port, "/", { host: `evil.test:${server.port}` }),
    403,
  );
  const plain = await fetch(`${server.url}/api/project/reload`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "text/plain" },
    body: "{}",
  });
  assert.equal(plain.status, 415);
  assert.equal(
    (
      await api("/api/project", undefined, {
        origin: `http://localhost:${server.port}`,
      })
    ).status,
    200,
  );
  assert.equal((await api("/api/unknown")).status, 404);
  const malformed = await fetch(`${server.url}/api/project/open`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: "{",
  });
  assert.equal(malformed.status, 400);
});

test("the editor serves its application without leaking other files", async (t) => {
  const { server } = await editor(t);
  const page = await fetch(`${server.url}/projects/new`);
  assert.equal(page.status, 200);
  assert.match(
    page.headers.get("content-security-policy") ?? "",
    /script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/,
  );
  assert.equal(page.headers.get("x-frame-options"), "DENY");
  const script = await fetch(`${server.url}/assets/app.js`);
  assert.equal(
    script.headers.get("content-type"),
    "text/javascript; charset=utf-8",
  );
  assert.match(script.headers.get("cache-control") ?? "", /immutable/);
  for (const path of [
    "/../secret.txt",
    "/%2e%2e/secret.txt",
    "/missing.js",
    "/%E0%A4%A",
  ])
    assert.notEqual(
      await raw(server.port, path, { host: `127.0.0.1:${server.port}` }),
      200,
      path,
    );
  assert.equal(
    (await fetch(`${server.url}/assets/app.js`, { method: "POST" })).status,
    405,
  );
});

test("the editor API opens, edits and saves drafts with conflict detection", async (t) => {
  const { project, api } = await editor(t);
  const session = await api<{ starters: unknown[] }>("/api/session");
  assert.equal(session.body.starters.length, 3);
  let state = (
    await api<RecipeEditorState>("/api/project/open", {
      recipe: "recipes/hello.yaml",
      config: "recipes/outpost.yaml",
      starter: "ephemeral",
    })
  ).body;
  assert.deepEqual(state.diagnostics, []);
  assert.equal(
    (
      await api("/api/project/edit", {
        role: "recipe",
        revision: state.revision,
        operations: [{ type: "explode" }],
      })
    ).status,
    422,
  );
  const stale = await api("/api/project/edit", {
    role: "recipe",
    revision: state.revision + 5,
    operations: [{ type: "remove-task", key: "read" }],
  });
  assert.equal(stale.status, 409);
  const cycle = await api("/api/project/edit", {
    role: "recipe",
    revision: state.revision,
    operations: [{ type: "connect", source: "read", target: "write" }],
  });
  assert.equal(cycle.status, 422);
  assert.equal(cycle.body.error.diagnostic.code, "dependency-cycle");
  state = (
    await api<RecipeEditorState>("/api/project/edit", {
      role: "recipe",
      revision: state.revision,
      operations: [{ type: "rename-task", key: "read", to: "show" }],
    })
  ).body;
  state = (
    await api<RecipeEditorState>("/api/project/layout", {
      revision: state.revision,
      layout: { version: 1, nodes: { show: { x: 1, y: 2 } } },
    })
  ).body;
  assert.equal(state.layoutDirty, true);
  state = (await api<RecipeEditorState>("/api/project/save", {})).body;
  assert.equal(state.recipe?.dirty, false);
  assert.match(
    await readFile(join(project, "recipes", "hello.yaml"), "utf8"),
    /key: show/,
  );
  assert.deepEqual(
    JSON.parse(
      await readFile(join(project, "recipes", "hello.editor.json"), "utf8"),
    ),
    { version: 1, nodes: { show: { x: 1, y: 2 } } },
  );
  state = (
    await api<RecipeEditorState>("/api/project/undo", {
      revision: state.revision,
    })
  ).body;
  await writeFile(join(project, "recipes", "hello.yaml"), "version: 3\n");
  const conflict = await api("/api/project/save", {});
  assert.equal(conflict.status, 409);
  assert.deepEqual(conflict.body.error.details.files, ["recipes/hello.yaml"]);
  state = (
    await api<RecipeEditorState>("/api/project/redo", {
      revision: state.revision,
    })
  ).body;
  state = (
    await api<RecipeEditorState>("/api/project/text", {
      role: "config",
      revision: state.revision,
      text: "version: 3\nworkspace: { kind: ephemeral }\nsandbox: { provider: local }\n",
    })
  ).body;
  assert.equal(state.config?.dirty, true);
  state = (await api<RecipeEditorState>("/api/project/reload", {})).body;
  assert.equal(state.config?.dirty, false);
  const plan = await api("/api/project/plan");
  assert.equal(plan.status, 422);
  const files = await api<{ name: string }[]>("/api/files?path=recipes");
  assert.deepEqual(
    files.body.map((entry) => entry.name),
    ["hello.editor.json", "hello.yaml", "outpost.yaml"],
  );
  assert.equal((await api("/api/files?path=../")).status, 400);
  const schema = await api<{ title?: string }>("/api/schemas/recipe");
  assert.equal(typeof schema.body.title, "string");
});

test("editor events stream the state and disk changes until the server closes", async (t) => {
  const { project, server, api } = await editor(t);
  await writeFile(
    join(project, "recipe.yaml"),
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n",
  );
  await api("/api/project/open", { recipe: "recipe.yaml" });
  const response = await fetch(`${server.url}/api/events`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(
    response.headers.get("content-type"),
    "text/event-stream; charset=utf-8",
  );
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  async function event(): Promise<RecipeEditorState | undefined> {
    for (;;) {
      const end = buffer.indexOf("\n\n");
      if (end >= 0) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const data = /^data: (.*)$/m.exec(block);
        if (data) return JSON.parse(data[1]!) as RecipeEditorState;
        continue;
      }
      const { value, done } = await reader.read();
      if (done) return undefined;
      buffer += decoder.decode(value, { stream: true });
    }
  }
  assert.match((await event())?.recipe?.text ?? "", /value: 1/);
  await writeFile(
    join(project, "recipe.yaml"),
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 2\n",
  );
  assert.match((await event())?.recipe?.text ?? "", /value: 2/);
  await server.close();
  assert.equal(await event(), undefined);
});

test("the recipe editor command prints its URL and stops on SIGINT", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-editor-cli-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(
    join(directory, "recipe.yaml"),
    "version: 3\nname: n\ntasks:\n  - key: a\n    value: 1\n",
  );
  const child = spawn(
    process.execPath,
    [
      resolve("src/cli/main.ts"),
      "recipe",
      "editor",
      "--directory",
      directory,
      "--file",
      join(directory, "recipe.yaml"),
      "--config",
      join(directory, "missing.yaml"),
      "--no-open",
      "--json",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  const [line] = (await once(
    createInterface({ input: child.stdout! }),
    "line",
  )) as [string];
  const { url } = JSON.parse(line) as { url: string };
  const parsed = new URL(url);
  const secret = new URLSearchParams(parsed.hash.slice(1)).get("token")!;
  const response = await fetch(`${parsed.origin}/api/session`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const session = (await response.json()) as {
    files: { recipe?: string };
    suggested: { config?: string };
  };
  assert.equal(session.files.recipe, "recipe.yaml");
  assert.equal(session.suggested.config, "missing.yaml");
  child.kill("SIGINT");
  const [code] = await once(child, "exit");
  assert.equal(code, process.platform === "win32" ? null : 130);
  await assert.rejects(fetch(`${parsed.origin}/api/session`));
});

test("the recipe editor command refuses an invalid port", async () => {
  const child = spawn(
    process.execPath,
    [
      resolve("src/cli/main.ts"),
      "recipe",
      "editor",
      "--port",
      "70000",
      "--no-open",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let stderr = "";
  child.stderr!.on(
    "data",
    (chunk: Buffer) => (stderr += chunk.toString("utf8")),
  );
  const [code] = await once(child, "exit");
  assert.equal(code, 1);
  assert.match(stderr, /--port must be an integer between 0 and 65535/);
});

test("route signals abort on client disconnects, not once the body is read", async (t) => {
  let release!: () => void;
  const held = new Promise<void>((done) => (release = done));
  const observed: boolean[] = [];
  const server = await serveEditor({
    token,
    routes: {
      "POST /api/slow": async ({ signal }) => {
        await new Promise((done) => setTimeout(done, 30));
        observed.push(signal.aborted);
        return { json: { aborted: signal.aborted } };
      },
      "POST /api/held": async ({ signal }) => {
        await new Promise((done) => signal.addEventListener("abort", done));
        release();
        return { json: {} };
      },
    },
  });
  t.after(() => server.close());
  const headers = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
  const slow = await fetch(`${server.url}/api/slow`, {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.deepEqual(await slow.json(), { aborted: false });
  const client = new AbortController();
  const pending = fetch(`${server.url}/api/held`, {
    method: "POST",
    headers,
    body: "{}",
    signal: client.signal,
  });
  setTimeout(() => client.abort(), 30);
  await assert.rejects(pending);
  await held;
  assert.deepEqual(observed, [false]);
});
