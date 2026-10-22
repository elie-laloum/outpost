import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { readRecipeConfigurationModel } from "../../src/application/recipes/configuration-model.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

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

test("sandboxes reference declared workspaces of the same mode", async () => {
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
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 3,
        workspace: { kind: "git", repository: "../app" },
        workspaces: { files: { kind: "ephemeral" } },
      },
      file,
      document,
    ),
    diagnostic(/Workspace files uses a different mode/, [
      "workspaces",
      "files",
      "kind",
    ]),
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
