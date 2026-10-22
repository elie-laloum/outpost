import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRecipeRuntime } from "../src/recipes.ts";
import { git } from "../src/infrastructure/git.ts";
import { repository } from "./helpers.ts";

const engine = process.env.OUTPOST_CONTAINER_ENGINE;
const gitImage = process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest";
const fileImage =
  process.env.OUTPOST_FILE_CONTAINER_IMAGE ?? "docker.io/library/node:24-slim";

async function project(t: { after(callback: () => Promise<void>): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-container-zones-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const write = (recipe: unknown, configuration: unknown) =>
    Promise.all([
      writeFile(file, JSON.stringify(recipe)),
      writeFile(config, JSON.stringify(configuration)),
    ]);
  return { directory, file, config, write };
}

function shell(key: string, sandbox: string, script: string, after?: string) {
  return {
    key,
    sandbox,
    command: { executable: "sh", arguments: ["-c", script] },
    ...(after ? { after: [after] } : {}),
  };
}

// Container, host, then container again: each sandbox reads what the previous one left.
const tasks = (record: string) => [
  shell("container", "container", `echo "$ZONE" > zone.txt && ${record}`),
  shell(
    "host",
    "host",
    `cat zone.txt && echo "$ZONE" >> zone.txt && ${record}`,
    "container",
  ),
  shell(
    "back",
    "back",
    `cat zone.txt && echo "$ZONE" >> zone.txt && ${record}`,
    "host",
  ),
];

for (const repositoryMode of ["mounted", "isolated"] as const)
  test(
    `a Git workspace keeps its files across container and host sandboxes (${repositoryMode})`,
    { skip: !engine },
    async (t) => {
      const root = await repository(t);
      const { file, config, write } = await project(t);
      const container = (zone: string) => ({
        provider: engine,
        image: gitImage,
        networks: "none",
        repositoryMode,
        variables: { ZONE: zone },
      });
      await write(
        {
          version: 3,
          name: "container-zones",
          tasks: tasks('git add zone.txt && git commit -qm "$ZONE"'),
        },
        {
          version: 3,
          workspace: { kind: "git", repository: root },
          sandbox: { provider: "local" },
          sandboxes: {
            container: container("container"),
            host: { provider: "local", variables: { ZONE: "host" } },
            back: container("back"),
          },
        },
      );
      await using runtime = await createRecipeRuntime({ file, config });
      const report = await runtime.run();
      assert.equal(report.status, "done", JSON.stringify(report.errors));
      assert.equal(report.outputs.host?.stdout, "container\n");
      assert.equal(report.outputs.back?.stdout, "container\nhost\n");
      assert.equal(
        await git(root, ["show", "main:zone.txt"]),
        "container\nhost\nback\n",
      );
    },
  );

test(
  "a file workspace keeps its files across container and host sandboxes",
  { skip: !engine },
  async (t) => {
    const { directory, file, config, write } = await project(t);
    const container = (zone: string) => ({
      provider: engine,
      image: fileImage,
      networks: "none",
      variables: { ZONE: zone },
    });
    await write(
      { version: 3, name: "container-zones", tasks: tasks("true") },
      {
        version: 3,
        runtime: { directory: "./control", namespace: "container-zones" },
        workspace: { kind: "ephemeral" },
        sandbox: { provider: "local" },
        outputs: [
          {
            paths: ["zone.txt"],
            destination: "./published",
            policy: "create",
          },
        ],
        sandboxes: {
          container: container("container"),
          host: { provider: "local", variables: { ZONE: "host" } },
          back: container("back"),
        },
      },
    );
    await using runtime = await createRecipeRuntime({ file, config });
    const report = await runtime.run();
    assert.equal(report.status, "done", JSON.stringify(report.errors));
    assert.equal(report.outputs.host?.stdout, "container\n");
    assert.equal(report.outputs.back?.stdout, "container\nhost\n");
    assert.equal(
      await readFile(join(directory, "published", "zone.txt"), "utf8"),
      "container\nhost\nback\n",
    );
  },
);
