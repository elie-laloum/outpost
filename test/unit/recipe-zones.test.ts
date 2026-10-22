import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname, resolve } from "node:path";
import { readRecipeConfigurationModel } from "../../src/application/recipes/configuration-model.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import { defineRecipe } from "../../src/application/recipe.ts";

const file = resolve("zones/execution.yaml");
const document = parseRecipe(
  JSON.stringify({
    version: 3,
    name: "zones",
    tasks: [
      { key: "draft", command: { executable: "true" }, sandbox: "docker" },
      { key: "review", command: { executable: "true" }, sandbox: "podman" },
    ],
  }),
);

function diagnostic(pattern: RegExp, path: readonly (string | number)[]) {
  return (error: unknown) => {
    assert.ok(error instanceof ConfigurationError, String(error));
    assert.match(error.message, pattern);
    assert.deepEqual(error.diagnostic.path, path);
    return true;
  };
}

test("Git configurations declare named workspaces and sandboxes that open them", async () => {
  const model = await readRecipeConfigurationModel(
    {
      version: 3,
      workspace: { kind: "git", repository: "../app" },
      sandbox: { provider: "local" },
      workspaces: {
        review: {
          kind: "git",
          repository: "../app",
          branch: { mode: "named", name: "review" },
          label: "review",
        },
      },
      sandboxes: {
        docker: { provider: "docker", image: "outpost:claude" },
        podman: {
          workspace: { $ref: "workspaces.review" },
          provider: "podman",
          image: "outpost:claude",
        },
      },
    },
    file,
    document,
  );
  assert.deepEqual(model.workspaces, {
    review: {
      kind: "git",
      repository: resolve("app"),
      branch: { mode: "named", name: "review" },
    },
  });
  assert.deepEqual(model.sandboxes, {
    docker: {},
    podman: { workspace: "review" },
  });
  assert.deepEqual(model.components.workspaces, {
    review: { label: "review" },
  });
  assert.deepEqual(model.components.sandboxes, {
    docker: { provider: "docker", image: "outpost:claude" },
    podman: { provider: "podman", image: "outpost:claude" },
  });
});

test("named Git workspaces on one repository need their own branch", async () => {
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: {
          kind: "git",
          repository: "../app",
          branch: { mode: "named", name: "work" },
        },
        workspaces: {
          other: {
            kind: "git",
            repository: "../app",
            branch: { mode: "named", name: "work" },
          },
        },
      },
      file,
      document,
    ),
    diagnostic(/Workspaces workspace and other check out the same branch/, [
      "workspaces",
      "other",
      "branch",
    ]),
  );
});

test("sandboxes reference declared workspaces", async () => {
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: { kind: "git", repository: "../app" },
        sandboxes: {
          docker: {
            workspace: { $ref: "workspaces.missing" },
            provider: "local",
          },
        },
      },
      file,
      document,
    ),
    diagnostic(/Sandbox docker references an unknown workspace/, [
      "sandboxes",
      "docker",
      "workspace",
    ]),
  );
});

test("configurations mix Git and file workspaces, each read by its own kind", async () => {
  const git = await readRecipeConfigurationModel(
    {
      version: 3,
      workspace: { kind: "git", repository: "../app" },
      runtime: { directory: "./state" },
      workspaces: {
        notes: {
          kind: "ephemeral",
          outputs: [
            { paths: ["*.md"], destination: "./notes", policy: "create" },
          ],
        },
      },
      sandboxes: {
        writer: { workspace: { $ref: "workspaces.notes" }, provider: "local" },
        builder: { provider: "local" },
      },
    },
    file,
    document,
  );
  assert.equal(git.workspace.kind, "git");
  assert.equal(git.workspaces.notes?.kind, "files");
  assert.ok(git.sandboxes.writer?.plan);
  assert.equal(git.sandboxes.builder?.plan, undefined);
  assert.equal(git.runtime?.directory, resolve(dirname(file), "state"));
  assert.deepEqual(git.components.workspaces, {});
  assert.equal(git.components.runtime, undefined);
  const files = await readRecipeConfigurationModel(
    {
      version: 3,
      workspace: { kind: "ephemeral" },
      sandbox: { provider: "local" },
      integration: { strategy: "merge" },
      workspaces: {
        app: { kind: "git", repository: "../app", copies: "auto" },
      },
      sandboxes: {
        coder: { workspace: { $ref: "workspaces.app" }, provider: "local" },
      },
    },
    file,
    document,
  );
  assert.equal(files.workspace.kind, "files");
  assert.equal(files.workspaces.app?.kind, "git");
  assert.equal(files.sandboxes.coder?.plan, undefined);
  assert.deepEqual(files.components.workspaces, { app: { copies: "auto" } });
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: { kind: "git", repository: "../app" },
        runtime: { directory: "./state" },
      },
      file,
      document,
    ),
    diagnostic(/file runtime and outputs require a file workspace/, [
      "runtime",
    ]),
  );
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: { kind: "git", repository: "../app" },
        workspaces: { notes: { kind: "ephemeral" } },
        outputs: [
          { paths: ["*.md"], destination: "./notes", policy: "create" },
        ],
      },
      file,
      document,
    ),
    diagnostic(/file runtime and outputs require a file workspace/, [
      "outputs",
    ]),
  );
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: { kind: "ephemeral" },
        integration: { strategy: "merge" },
      },
      file,
      document,
    ),
    diagnostic(/Git integration is unavailable/, ["integration"]),
  );
});

test("file sandboxes are planned against the workspace they open", async () => {
  const model = await readRecipeConfigurationModel(
    {
      version: 3,
      workspaces: {
        scratch: {
          kind: "ephemeral",
          outputs: [
            { paths: ["*.json"], destination: "./results", policy: "create" },
          ],
        },
        source: { kind: "directory", directory: "./source" },
      },
      sandboxes: {
        docker: {
          workspace: { $ref: "workspaces.scratch" },
          provider: "docker",
          image: "outpost:claude",
        },
        podman: {
          workspace: { $ref: "workspaces.source" },
          provider: "local",
        },
      },
    },
    file,
    document,
  );
  assert.equal(model.workspace.kind, "files");
  const scratch = model.workspaces.scratch;
  assert.equal(scratch?.kind, "files");
  assert.deepEqual(scratch.kind === "files" && scratch.files.outputs, [
    {
      paths: ["*.json"],
      destination: resolve("zones/results"),
      policy: "create",
    },
  ]);
  assert.equal(model.sandboxes.docker?.workspace, "scratch");
  assert.equal(model.sandboxes.docker?.plan?.binding, "ephemeral");
  assert.equal(model.sandboxes.docker?.plan?.sandbox.provider, "docker");
  assert.equal(model.sandboxes.podman?.plan?.binding, "copy");
  assert.equal(model.components.workspaces, undefined);
});

test("file sandboxes report their own location when they cannot run the workspace", async () => {
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspaces: { scratch: { kind: "ephemeral" } },
        sandboxes: {
          docker: {
            workspace: { $ref: "workspaces.scratch" },
            provider: "docker",
          },
        },
      },
      file,
      document,
    ),
    diagnostic(/File workspaces require an explicit container image/, [
      "sandboxes",
      "docker",
      "image",
    ]),
  );
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        sandboxes: { docker: { provider: "local" } },
      },
      file,
      document,
    ),
    diagnostic(/Sandbox docker requires a workspace source/, [
      "sandboxes",
      "docker",
      "provider",
    ]),
  );
});

test("only command and agent tasks select a named sandbox", () => {
  assert.equal(document.tasks[0]?.sandbox, "docker");
  assert.throws(
    () =>
      parseRecipe(
        JSON.stringify({
          version: 3,
          name: "zones",
          tasks: [{ key: "constant", value: 1, sandbox: "docker" }],
        }),
      ),
    diagnostic(/sandbox requires a command or agent task/, [
      "tasks",
      0,
      "sandbox",
    ]),
  );
});

test("named file workspaces read their own inputs and retention", async () => {
  const model = await readRecipeConfigurationModel(
    {
      version: 3,
      runtime: { namespace: "zones" },
      workspaces: {
        seeded: {
          kind: "ephemeral",
          retention: {
            policy: "portable",
            transporter: { $ref: "transports.store" },
          },
          inputs: [
            { directory: "./seed", paths: ["notes.md"] },
            {
              snapshot: { key: "seed", revision: "1" },
              transporter: { $ref: "transports.store" },
            },
          ],
        },
      },
      sandboxes: {
        host: { workspace: { $ref: "workspaces.seeded" }, provider: "local" },
      },
    },
    file,
    document,
  );
  const seeded = model.workspaces.seeded;
  assert.ok(seeded?.kind === "files");
  assert.deepEqual(seeded.files.retention, {
    policy: "portable",
    transporter: "transports.store",
  });
  assert.deepEqual(seeded.files.inputs, [
    { directory: resolve("zones/seed"), paths: ["notes.md"] },
    {
      snapshot: { key: "seed", revision: "1" },
      transporter: "transports.store",
    },
  ]);
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspaces: {
          seeded: {
            kind: "ephemeral",
            inputs: [
              {
                directory: "./seed",
                snapshot: { key: "seed", revision: "1" },
              },
            ],
          },
        },
      },
      file,
      document,
    ),
    diagnostic(/Directory workspace inputs cannot declare snapshots/, [
      "workspaces",
      "seeded",
      "inputs",
      0,
      "snapshot",
    ]),
  );
});

test("recipes bound to one TypeScript sandbox refuse named sandboxes", () => {
  assert.throws(
    () =>
      defineRecipe(
        JSON.stringify({
          version: 3,
          name: "zones",
          tasks: [
            {
              key: "draft",
              command: { executable: "true" },
              sandbox: "docker",
            },
          ],
        }),
        {
          sandbox: {} as never,
        },
      ),
    /Named recipe sandboxes require createRecipeRuntime/,
  );
});
