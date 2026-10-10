import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  stat,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  createWorkspace,
  createSandbox,
  createLocalTransport,
  defineIsolatedCommandTask,
  defineWorkflow,
  inspectFileWorkspace,
  recoverFileWorkspace,
  restoreFileWorkspace,
  inspectWorkspacePublication,
  recoverWorkspacePublication,
  publishWorkspaceOutputs,
  prepareWorkspaceOutputs,
  createHarnessFileTools,
  createHarnessSearchTools,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import type { HarnessToolContext } from "../../src/domain/tool.types.ts";
import { refreshFilePublicationReport } from "../../src/application/recipes/file-publication-report.ts";
import type { Transport } from "../../src/domain/transport.types.ts";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";

test(
  "preparation SIGKILL retains registered roots before copy and during hooks for explicit adoption",
  { skip: process.platform === "win32" },
  async () => {
    for (const boundary of ["registered", "captured", "hook"]) {
      const root = await mkdtemp(join(tmpdir(), "outpost-preparation-crash-"));
      try {
        await mkdir(join(root, "source"));
        await writeFile(join(root, "source", "input.txt"), "source");
        const killed = await executeProcess({
          executable: process.execPath,
          arguments: [
            "test/fixtures/file-workspace-preparation-crash.ts",
            root,
            boundary,
          ],
        });
        assert.notEqual(killed.status, 0);
        const resource: unknown = JSON.parse(
          await readFile(join(root, "resource.json"), "utf8"),
        );
        assert.ok(
          resource &&
            typeof resource === "object" &&
            "id" in resource &&
            typeof resource.id === "string",
        );
        const inspection = await inspectFileWorkspace({
          id: resource.id,
          runtime: {
            directory: join(root, "control"),
            namespace: "preparation",
          },
        });
        assert.equal(inspection.record.preparation, "preparing");
        await assert.rejects(
          restoreFileWorkspace(inspection.record, {
            recover: { processesStopped: true },
          }),
          /preparation is incomplete/,
        );
        const workspace = await recoverFileWorkspace(inspection.record, {
          expectedRevision: inspection.reference.revision,
          processesStopped: true,
          recover: { processesStopped: true, adoptInterruptedFiles: true },
        });
        try {
          const settled = await workspace.checkpoint();
          assert.equal(settled.preparation, "ready");
          if (boundary === "hook") {
            assert.equal(
              await readFile(join(workspace.directory, "input.txt"), "utf8"),
              "source",
            );
            assert.equal(
              await readFile(join(workspace.directory, "partial.txt"), "utf8"),
              "retained",
            );
          }
          assert.equal(
            await readFile(join(root, "source", "input.txt"), "utf8"),
            "source",
          );
        } finally {
          await workspace.close();
        }
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    }
  },
);

test("failed preparation retains inspectable partial files and refuses ordinary restoration", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-preparation-failed-"));
  try {
    const runtime = {
      directory: join(root, "control"),
      namespace: "preparation",
    };
    await assert.rejects(
      createWorkspace({
        source: { kind: "ephemeral" },
        runtime,
        hooks: {
          workspaceReady: [
            {
              executable: process.execPath,
              arguments: [
                "-e",
                "require('node:fs').writeFileSync('partial.txt', 'retained'); process.exit(7)",
              ],
            },
          ],
        },
      }),
    );
    const transporter = createLocalTransport({
      directory: join(runtime.directory, "storage"),
    });
    const references = [];
    for await (const reference of transporter.list("workspaces/preparation/"))
      references.push(reference);
    assert.equal(references.length, 1);
    const id = references[0]!.key.split("/")[2]!;
    const inspection = await inspectFileWorkspace({ id, runtime });
    assert.equal(inspection.record.preparation, "failed");
    assert.equal(inspection.record.owner.state, "released");
    await assert.rejects(
      restoreFileWorkspace(inspection.record),
      /preparation is incomplete/,
    );
    const workspace = await recoverFileWorkspace(inspection.record, {
      expectedRevision: inspection.reference.revision,
      processesStopped: true,
      recover: { processesStopped: true, adoptInterruptedFiles: true },
    });
    try {
      assert.equal(
        await readFile(join(workspace.directory, "partial.txt"), "utf8"),
        "retained",
      );
    } finally {
      await workspace.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publication finish and rollback recover SIGKILL around every file mutation without executing work again", async () => {
  for (const boundary of [
    "quarantine-intent",
    "quarantined",
    "install-intent",
    "installed",
    "complete",
  ]) {
    for (const timing of ["before", "after"]) {
      if (boundary === "complete" && timing === "after") continue;
      for (const action of ["finish", "rollback"] as const) {
        const root = await mkdtemp(
          join(tmpdir(), "outpost-publication-crash-"),
        );
        try {
          await mkdir(join(root, "source"));
          await writeFile(join(root, "source", "value.json"), "old");
          const result = await executeProcess({
            executable: process.execPath,
            arguments: [
              resolve("test/fixtures/file-publication-crash.ts"),
              root,
              boundary,
              timing,
            ],
          });
          assert.notEqual(result.status, 0, `${boundary}/${timing}`);
          const { runtime, id } = JSON.parse(
            await readFile(join(root, "workspace.json"), "utf8"),
          );
          const transporter = createLocalTransport({
            directory: join(runtime.directory, "storage"),
          });
          const entries = [];
          for await (const entry of transporter.list("publications/crash/"))
            entries.push(entry);
          assert.equal(entries.length, 1, `${boundary}/${timing}`);
          const entry = entries[0]!;
          const reference = await recoverWorkspacePublication(
            transporter,
            entry,
            action,
            { processesStopped: true },
          );
          assert.equal(
            (await inspectWorkspacePublication(transporter, reference)).state,
            action === "finish" ? "complete" : "rolled-back",
          );
          assert.equal(
            await readFile(join(root, "source", "value.json"), "utf8"),
            action === "finish" ? "new" : "old",
          );
          const inspection = await inspectFileWorkspace({ runtime, id });
          const workspace = await recoverFileWorkspace(inspection.record, {
            expectedRevision: inspection.reference.revision,
            processesStopped: true,
            recover: { processesStopped: true, adoptInterruptedFiles: true },
          });
          await workspace.close({ preserve: true });
        } finally {
          await rm(root, { recursive: true, force: true });
        }
      }
    }
  }
});

test("isolated file commands allocate independent roots concurrently and retain their results", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-isolated-files-"));
  try {
    const provider = createLocalSandboxProvider();
    const task = (key: string) =>
      defineIsolatedCommandTask({
        key,
        request: () => ({
          workspaceSource: { kind: "ephemeral" },
          runtime: { directory: join(root, "control") },
          retention: { policy: "local" },
          sandboxProvider: provider,
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              `require('fs').writeFileSync('same.json',${JSON.stringify(key)});setTimeout(()=>process.stdout.write(process.cwd()),100)`,
            ],
          },
        }),
      });
    const left = task("left"),
      right = task("right");
    const result = await defineWorkflow("parallel-files", [left, right]).start({
      concurrency: 2,
    });
    result.unwrap();
    assert.notEqual(result.value(left).stdout, result.value(right).stdout);
    assert.equal(
      await readFile(join(result.value(left).stdout, "same.json"), "utf8"),
      "left",
    );
    assert.equal(
      await readFile(join(result.value(right).stdout, "same.json"), "utf8"),
      "right",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("filesystem tools list ignored files, refuse links and search without a Git command", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-filesystem-tools-"));
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control") },
    });
    await writeFile(join(workspace.directory, ".gitignore"), "ignored.txt");
    await writeFile(join(workspace.directory, "ignored.txt"), "find me\n");
    const requests: string[] = [];
    const provider = createLocalSandboxProvider();
    const acquired = await provider.workspaces!.acquire({
      workspace: await workspace.checkpoint(),
      runtime: workspace.runtime,
      variables: {},
      signal: new AbortController().signal,
    });
    const lease: SandboxLease = {
      ...acquired,
      async invoke(command) {
        requests.push(command.executable);
        return acquired.invoke(command);
      },
    };
    const context: HarnessToolContext = {
      sandbox: lease,
      signal: new AbortController().signal,
      callId: "test",
      model: { name: "test" },
      observe() {},
    };
    try {
      const list = createHarnessFileTools({
        selection: "filesystem",
      }).tools.find((tool) => tool.name === "list_files")!;
      assert.match(String(await list.execute({}, context)), /ignored.txt/);
      const search = createHarnessSearchTools({ selection: "filesystem" })
        .tools[0]!;
      assert.match(
        String(await search.execute({ pattern: "find me" }, context)),
        /ignored.txt:1:find me/,
      );
      assert.deepEqual(requests, ["node", "node"]);
      if (process.platform !== "win32") {
        await symlink(root, join(workspace.directory, "outside"));
        const refused = await list.execute({ path: "outside" }, context);
        assert.equal(typeof refused, "object");
        assert.ok(typeof refused === "object" && refused.isError);
        assert.match(
          typeof refused === "object" ? refused.content : "",
          /link|Filesystem/,
        );
      }
    } finally {
      await lease.release();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("exclusive publication preserves empty directories, binary contents and portable permissions", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "outpost-publication-directories-"),
  );
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control") },
    });
    await mkdir(join(workspace.directory, "empty"));
    await chmod(join(workspace.directory, "empty"), 0o750);
    await writeFile(
      join(workspace.directory, "binary"),
      Buffer.from([0, 128, 255]),
    );
    const destination = join(root, "published");
    await publishWorkspaceOutputs(workspace, {
      paths: ["**"],
      destination,
      policy: "create",
    });
    assert.deepEqual(
      await readFile(join(destination, "binary")),
      Buffer.from([0, 128, 255]),
    );
    await assert.rejects(
      publishWorkspaceOutputs(workspace, {
        paths: ["**"],
        destination,
        policy: "create",
      }),
      /already exists/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publication recovery refreshes only the report and refuses foreign recovery staging", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-publication-report-"));
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control"), namespace: "report" },
    });
    await writeFile(join(workspace.directory, "result.json"), "ready");
    const remaining = ["second", "third"].map((name) => ({
      paths: ["result.json"],
      destination: join(root, name),
      policy: "create" as const,
    }));
    await prepareWorkspaceOutputs(workspace, remaining);
    const publication = await publishWorkspaceOutputs(workspace, {
      paths: ["result.json"],
      destination: join(root, "outputs"),
      policy: "create",
    });
    const report: RecipeReport = {
      name: "report",
      executionId: "finished",
      status: "failed",
      workflowStatus: "done",
      workspaceInfo: {
        ...(await workspace.checkpoint()),
        publications: [
          {
            id: publication.id,
            state: "recovery-required",
            reference: publication.reference,
          },
        ],
      },
      tasks: [{ key: "produce", status: "done", attempts: 1 }],
      outputs: { produce: { status: 0 } },
      errors: [
        {
          publicationId: publication.id,
          publicationState: "recovery-required",
          message: "Interrupted publication",
        },
      ],
    };
    const settled = await refreshFilePublicationReport(report, 1);
    assert.equal(settled.status, "done");
    assert.equal(settled.tasks, report.tasks);
    assert.equal(settled.executionId, "finished");
    assert.equal(settled.fileOutputs?.[0]?.id, publication.id);
    assert.deepEqual(settled.errors, []);
    assert.equal(settled.workspaceInfo?.publications?.[0]?.state, "complete");
    assert.equal(
      report.workspaceInfo?.publications?.[0]?.state,
      "recovery-required",
    );
    const pending = await refreshFilePublicationReport(report, 2);
    assert.equal(pending.status, "failed");
    assert.match(pending.errors[0]!.message, /without replaying/);
    await publishWorkspaceOutputs(workspace, remaining[0]!);
    const partlyRecovered = await refreshFilePublicationReport(report, 3);
    assert.equal(partlyRecovered.status, "failed");
    assert.equal(partlyRecovered.fileOutputs?.length, 2);
    await publishWorkspaceOutputs(workspace, remaining[1]!);
    const fullyRecovered = await refreshFilePublicationReport(
      partlyRecovered,
      3,
    );
    assert.equal(fullyRecovered.status, "done");
    assert.equal(fullyRecovered.fileOutputs?.length, 3);
    assert.equal(fullyRecovered.tasks, report.tasks);
    assert.deepEqual(fullyRecovered.errors, []);
    await publishWorkspaceOutputs(workspace, {
      paths: ["result.json"],
      destination: join(root, "unrelated"),
      policy: "create",
    });
    const matchingOnly = await refreshFilePublicationReport(partlyRecovered, 3);
    assert.equal(matchingOnly.status, "done");
    assert.equal(matchingOnly.fileOutputs?.length, 3);
    const transporter = createLocalTransport({
      directory: join(workspace.runtime.directory, "storage"),
    });
    const journal = await inspectWorkspacePublication(
      transporter,
      publication.reference,
    );
    const foreign = await transporter.write(
      "foreign-journal",
      new TextEncoder().encode(
        JSON.stringify({ ...journal, backup: join(root, "foreign") }),
      ),
      { ifRevision: null },
    );
    await assert.rejects(
      recoverWorkspacePublication(transporter, foreign, "rollback"),
      /recovery staging/,
    );
    assert.equal(
      await readFile(join(root, "outputs", "result.json"), "utf8"),
      "ready",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("closing a replaced file materialization preserves the replacement until explicit recovery", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-replaced-files-"));
  try {
    const workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control") },
    });
    const retained = join(root, "original"),
      external = join(root, "external");
    await rename(workspace.directory, retained);
    await mkdir(workspace.directory);
    await writeFile(join(workspace.directory, "external.txt"), "preserve");
    await assert.rejects(workspace.close(), /materialization was replaced/);
    assert.equal(
      await readFile(join(workspace.directory, "external.txt"), "utf8"),
      "preserve",
    );
    await rename(workspace.directory, external);
    await rename(retained, workspace.directory);
    await workspace.close();
    assert.equal(
      await readFile(join(external, "external.txt"), "utf8"),
      "preserve",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test(
  "owned cleanup removes copied read-only directories without chmod on borrowed sources or links",
  { skip: process.platform === "win32" },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "outpost-readonly-cleanup-"));
    const source = join(root, "source"),
      external = join(root, "external");
    try {
      await mkdir(source);
      await mkdir(join(source, "readonly"));
      await mkdir(external);
      await writeFile(join(source, "readonly", "input.txt"), "source");
      await chmod(join(source, "readonly"), 0o500);
      await chmod(external, 0o500);
      const workspace = await createWorkspace({
        source: {
          kind: "directory",
          directory: source,
          access: { mode: "copy" },
        },
        runtime: { directory: join(root, "control") },
      });
      await symlink(external, join(workspace.directory, "borrowed"));
      await workspace.close();
      await assert.rejects(stat(workspace.directory), /ENOENT/);
      assert.equal((await stat(join(source, "readonly"))).mode & 0o777, 0o500);
      assert.equal((await stat(external)).mode & 0o777, 0o500);
      assert.equal(
        await readFile(join(source, "readonly", "input.txt"), "utf8"),
        "source",
      );
    } finally {
      await chmod(join(source, "readonly"), 0o700).catch(() => {});
      await chmod(external, 0o700).catch(() => {});
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "publication rollback restores access to its own settled read-only directories",
  { skip: process.platform === "win32" },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "outpost-readonly-publication-"));
    try {
      await using workspace = await createWorkspace({
        source: { kind: "ephemeral" },
        runtime: { directory: join(root, "control") },
      });
      await mkdir(join(workspace.directory, "readonly"));
      await writeFile(join(workspace.directory, "readonly", "value"), "ready");
      await chmod(join(workspace.directory, "readonly"), 0o500);
      const storage = createLocalTransport({
        directory: join(root, "journal"),
      });
      let interrupted = false;
      const fault: Transport = {
        ...storage,
        async write(key, bytes, options) {
          const journal: unknown = JSON.parse(new TextDecoder().decode(bytes));
          if (
            !interrupted &&
            journal &&
            typeof journal === "object" &&
            "state" in journal &&
            journal.state === "complete"
          ) {
            interrupted = true;
            throw new Error("Completion interrupted");
          }
          return storage.write(key, bytes, options);
        },
      };
      const destination = join(root, "published");
      await assert.rejects(
        publishWorkspaceOutputs(
          workspace,
          { paths: ["**"], destination, policy: "create" },
          fault,
        ),
        (error) =>
          error instanceof Error &&
          "details" in error &&
          !!error.details &&
          typeof error.details === "object" &&
          "state" in error.details &&
          error.details.state === "rolled-back",
      );
      await assert.rejects(stat(destination), /ENOENT/);
      assert.equal(
        await readFile(join(workspace.directory, "readonly", "value"), "utf8"),
        "ready",
      );
      for await (const reference of storage.list("publications/")) {
        const journal = await inspectWorkspacePublication(storage, reference);
        await chmod(join(journal.staging, "readonly"), 0o700);
      }
      await chmod(join(workspace.directory, "readonly"), 0o700);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test("portable publication journals use the explicit conservation Transport and CLI inspection resolves it", async () => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-portable-publication-")),
  );
  try {
    const transporter = createLocalTransport({
      directory: join(root, "conserved"),
    });
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: {
        directory: join(root, "control"),
        namespace: "portable-publication",
      },
      retention: { policy: "portable", transporter },
    });
    await writeFile(join(workspace.directory, "value.json"), "ready");
    const publication = await publishWorkspaceOutputs(workspace, {
      paths: ["value.json"],
      destination: join(root, "outputs"),
      policy: "create",
    });
    assert.equal(
      (await inspectWorkspacePublication(transporter, publication.reference))
        .state,
      "complete",
    );
    const file = join(root, "recipe.yaml"),
      config = join(root, "outpost.yaml");
    await writeFile(
      file,
      JSON.stringify({
        version: 3,
        name: "inspect",
        tasks: [{ key: "value", value: true }],
      }),
    );
    await writeFile(
      config,
      JSON.stringify({
        version: 3,
        runtime: { directory: "./control", namespace: "portable-publication" },
        workspace: {
          kind: "ephemeral",
          retention: {
            policy: "portable",
            transporter: { $ref: "transports.files" },
          },
        },
        transports: { files: { type: "local", directory: "./conserved" } },
      }),
    );
    const arguments_ = [
      resolve("src/cli/main.ts"),
      "recovery",
      "publication",
      "inspect",
      "--runtime-directory",
      workspace.runtime.directory,
      "--namespace",
      workspace.runtime.namespace,
      "--publication-id",
      publication.id,
      "--file",
      file,
      "--config",
      config,
      "--json",
    ];
    const inspected = await executeProcess({
      executable: process.execPath,
      arguments: arguments_,
    });
    assert.equal(inspected.status, 0, inspected.stderr);
    assert.equal(JSON.parse(inspected.stdout).id, publication.id);
    await workspace.checkpoint();
    await workspace.close({ preserve: true });
    const workspaceArgs = [
      resolve("src/cli/main.ts"),
      "recovery",
      "workspace",
      "inspect",
      "--runtime-directory",
      workspace.runtime.directory,
      "--namespace",
      workspace.runtime.namespace,
      "--workspace-id",
      workspace.id,
      "--file",
      file,
      "--config",
      config,
      "--json",
    ];
    const workspaceInspection = await executeProcess({
      executable: process.execPath,
      arguments: workspaceArgs,
    });
    assert.equal(workspaceInspection.status, 0, workspaceInspection.stderr);
    const revision: unknown = JSON.parse(workspaceInspection.stdout).reference
      .revision;
    assert.ok(typeof revision === "string");
    const restoreArgs = [...workspaceArgs];
    restoreArgs[3] = "recover";
    restoreArgs[restoreArgs.indexOf("--runtime-directory") + 1] = join(
      root,
      "second-worker",
    );
    restoreArgs.push(
      "--portable",
      "--processes-stopped",
      "--revision",
      revision,
    );
    const recovered = await executeProcess({
      executable: process.execPath,
      arguments: restoreArgs,
    });
    assert.equal(recovered.status, 0, recovered.stderr);
    const restoredDirectory: unknown = JSON.parse(recovered.stdout).record
      .directory;
    assert.ok(
      typeof restoredDirectory === "string" &&
        restoredDirectory.startsWith(join(root, "second-worker")),
    );
    assert.equal(
      await readFile(join(restoredDirectory, "value.json"), "utf8"),
      "ready",
    );
    const wrong = [...arguments_];
    wrong[wrong.indexOf("--namespace") + 1] = "another-project";
    const refused = await executeProcess({
      executable: process.execPath,
      arguments: wrong,
    });
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /namespace/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
