import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  createWorkspace,
  createSandbox,
  dispatch,
  publishWorkspaceOutputs,
  prepareWorkspaceOutputs,
  workspaceFingerprint,
  snapshotWorkspaceFiles,
  restoreWorkspaceFiles,
  changed,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import {
  createMemorySandboxProvider,
  scriptedAgent,
} from "../../src/testing.ts";
import { createLocalTransport } from "../../src/infrastructure/local-transport.ts";
import type { Transport } from "../../src/domain/transport.types.ts";
import { restoreFileWorkspace } from "../../src/application/file-workspace.ts";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

test("file sandboxes retain changed-hook fingerprints and prevent commands after preparation failure", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-file-hooks-"));
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control") },
    });
    await writeFile(join(workspace.directory, "input"), "first");
    await using sandbox = await createSandbox({
      workspace,
      sandboxProvider: createLocalSandboxProvider(),
      hooks: {
        hostReady: [
          {
            executable: process.execPath,
            arguments: [
              "-e",
              "require('node:fs').appendFileSync('host-runs', 'run\\n')",
            ],
            when: changed(["input"]),
          },
        ],
        sandboxReady: [
          {
            executable: process.execPath,
            arguments: [
              "-e",
              "const fs=require('node:fs'); if(fs.readFileSync('input','utf8')==='fail')process.exit(7); fs.appendFileSync('sandbox-runs','run\\n')",
            ],
            when: changed(["input"]),
          },
        ],
      },
    });
    const command = {
      executable: process.execPath,
      arguments: [
        "-e",
        "require('node:fs').appendFileSync('commands', 'run\\n')",
      ],
    };
    await sandbox.command(command);
    await sandbox.command(command);
    assert.equal(
      await readFile(join(workspace.directory, "host-runs"), "utf8"),
      "run\n",
    );
    assert.equal(
      await readFile(join(workspace.directory, "sandbox-runs"), "utf8"),
      "run\n",
    );
    await writeFile(join(workspace.directory, "input"), "second");
    await sandbox.command(command);
    assert.equal(
      await readFile(join(workspace.directory, "host-runs"), "utf8"),
      "run\nrun\n",
    );
    assert.equal(
      await readFile(join(workspace.directory, "sandbox-runs"), "utf8"),
      "run\nrun\n",
    );
    await writeFile(join(workspace.directory, "input"), "fail");
    await assert.rejects(sandbox.command(command));
    assert.equal(
      await readFile(join(workspace.directory, "commands"), "utf8"),
      "run\nrun\nrun\n",
    );
    await writeFile(join(workspace.directory, "input"), "repaired");
    await sandbox.command(command);
    assert.equal(
      await readFile(join(workspace.directory, "commands"), "utf8"),
      "run\nrun\nrun\nrun\n",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("copies share a source containing their excluded runtime while mounts remain fenced", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-nested-runtime-"));
  const outsideRuntime = await mkdtemp(
    join(tmpdir(), "outpost-mount-control-"),
  );
  try {
    await writeFile(join(root, "input.txt"), "source");
    const options = {
      source: {
        kind: "directory" as const,
        directory: root,
        access: { mode: "copy" as const },
      },
      runtime: { directory: join(root, ".outpost") },
    };
    const first = await createWorkspace(options);
    try {
      const [second, third] = await Promise.all([
        createWorkspace(options),
        createWorkspace(options),
      ]);
      try {
        for (const workspace of [first, second, third]) {
          assert.equal(
            await readFile(join(workspace.directory, "input.txt"), "utf8"),
            "source",
          );
          await assert.rejects(
            lstat(join(workspace.directory, ".outpost")),
            /ENOENT/,
          );
        }
        await assert.rejects(
          createWorkspace({
            source: {
              kind: "directory",
              directory: root,
              access: { mode: "mount", target: "input", readOnly: true },
            },
            runtime: { directory: outsideRuntime },
          }),
          /active writer/,
        );
      } finally {
        await Promise.all([second.close(), third.close()]);
      }
      await using imported = await createWorkspace({
        source: { kind: "ephemeral" },
        runtime: options.runtime,
        inputs: [{ directory: root }],
      });
      assert.equal(
        await readFile(join(imported.directory, "input.txt"), "utf8"),
        "source",
      );
      await assert.rejects(
        lstat(join(imported.directory, ".outpost")),
        /ENOENT/,
      );
    } finally {
      await first.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outsideRuntime, { recursive: true, force: true });
  }
});

test("file selections refuse links through excluded aliases before copying or publishing", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-selected-link-"));
  try {
    const source = join(root, "source"),
      outside = join(root, "outside");
    await mkdir(source);
    await mkdir(outside);
    await writeFile(join(outside, "value.json"), "external");
    await symlink(outside, join(source, "alias"));
    await symlink("alias/value.json", join(source, "result.json"));
    await assert.rejects(
      createWorkspace({
        source: {
          kind: "directory",
          directory: source,
          access: { mode: "copy" },
        },
        paths: ["**/*.json"],
        runtime: { directory: join(root, "copy-control") },
      }),
      /outside the captured selection/,
    );
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "publish-control") },
    });
    await symlink("alias/value.json", join(workspace.directory, "result.json"));
    const destination = join(root, "published");
    await mkdir(destination);
    await symlink(outside, join(destination, "alias"));
    const output = {
      paths: ["**/*.json"],
      destination,
      policy: "update" as const,
    };
    await prepareWorkspaceOutputs(workspace, [output]);
    await assert.rejects(
      publishWorkspaceOutputs(workspace, output),
      /outside the captured selection/,
    );
    assert.equal(
      await readFile(join(outside, "value.json"), "utf8"),
      "external",
    );
    await assert.rejects(lstat(join(destination, "result.json")), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("directory copies preserve relative file and directory links with native separators", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-native-links-"));
  try {
    const source = join(root, "source");
    await mkdir(join(source, "nested"), { recursive: true });
    await writeFile(join(source, "nested", "value.txt"), "selected");
    await symlink("nested", join(source, "alias"), "dir");
    await symlink(
      join("alias", "value.txt"),
      join(source, "result.txt"),
      "file",
    );
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime: { directory: join(root, "control") },
    });
    assert.equal(
      await readFile(join(workspace.directory, "result.txt"), "utf8"),
      "selected",
    );
    assert.ok(
      (await lstat(join(workspace.directory, "alias"))).isSymbolicLink(),
    );
    assert.ok(
      (await lstat(join(workspace.directory, "result.txt"))).isSymbolicLink(),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("relative link traversal expands selected aliases before processing parent segments", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-relative-alias-"));
  try {
    const source = join(root, "source");
    await mkdir(join(source, "dir"), { recursive: true });
    await mkdir(join(source, "safe"));
    await writeFile(join(source, "value.json"), "selected");
    await writeFile(join(root, "value.json"), "external");
    await symlink("../safe", join(source, "dir", "alias"), "dir");
    await symlink("alias/../../value.json", join(source, "dir", "result.json"));
    await assert.rejects(
      createWorkspace({
        source: {
          kind: "directory",
          directory: source,
          access: { mode: "copy" },
        },
        runtime: { directory: join(root, "control") },
      }),
      /escapes selection/,
    );
    assert.equal(await readFile(join(root, "value.json"), "utf8"), "external");
    await rm(join(source, "dir", "result.json"));
    await symlink("alias/../value.json", join(source, "dir", "result.json"));
    await symlink("cycle-two", join(source, "cycle-one"));
    await symlink("cycle-one", join(source, "cycle-two"));
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime: { directory: join(root, "control") },
    });
    assert.equal(
      await readFile(join(workspace.directory, "dir", "result.json"), "utf8"),
      "selected",
    );
    assert.ok(
      (await lstat(join(workspace.directory, "cycle-one"))).isSymbolicLink(),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("file dialogue releases its sandbox before asking and resumes in another process without replay", async () => {
  const { root, runtime } = await fixture();
  try {
    const run = async (answer?: unknown) => {
      const result = await executeProcess({
        executable: process.execPath,
        arguments: [
          resolve("test/fixtures/file-interactive-workflow.ts"),
          runtime.directory,
          ...(answer ? [JSON.stringify(answer)] : []),
        ],
      });
      assert.equal(result.status, 0, result.stderr);
      return JSON.parse(result.stdout);
    };
    const first = await run();
    assert.equal(first.status, "waiting-input", JSON.stringify(first.errors));
    assert.equal(first.active, 0);
    assert.equal(
      await readFile(join(first.directory, "interview.txt"), "utf8"),
      "one",
    );
    const next = await run({
      executionId: first.executionId,
      key: "interview",
      requestId: first.inputRequests[0].id,
      actor: "owner",
      value: "accepted",
    });
    assert.equal(next.status, "done", JSON.stringify(next.errors));
    assert.equal(next.active, 0);
    assert.equal(next.directory, first.directory);
    assert.equal(next.value.turns, 2);
    assert.equal(
      await readFile(join(first.directory, "interview.txt"), "utf8"),
      "one",
    );
    assert.equal("branch" in next.value, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "outpost-files-"));
  const source = join(root, "documents");
  await mkdir(source);
  return { root, source, runtime: { directory: join(root, "control") } };
}

test("ephemeral commands retain exit status and reuse without invoking Git", async () => {
  const { root, runtime } = await fixture();
  try {
    const bin = join(root, "bin");
    const log = join(root, "git-invocations");
    await mkdir(bin);
    await writeFile(
      join(bin, "git"),
      `#!/bin/sh\necho invoked >> '${log}'\nexit 99\n`,
    );
    await chmod(join(bin, "git"), 0o700);
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime,
    });
    await using sandbox = await createSandbox({
      workspace,
      sandboxProvider: createLocalSandboxProvider(),
      variables: { PATH: `${bin}:${process.env.PATH}` },
    });
    const failed = await sandbox.command({
      executable: process.execPath,
      arguments: [
        "-e",
        "process.stdout.write('before');process.stdout.end();setTimeout(()=>process.exit(7),30)",
      ],
    });
    assert.equal(failed.status, 7);
    const success = await sandbox.command({
      executable: process.execPath,
      arguments: ["-e", "require('fs').writeFileSync('result.json','{}')"],
    });
    assert.equal(success.status, 0);
    assert.equal(
      await readFile(join(workspace.directory, "result.json"), "utf8"),
      "{}",
    );
    await assert.rejects(lstat(log), { code: "ENOENT" });
    await sandbox.close();
    await sandbox.close();
    assert.equal((await workspace.checkpoint()).generation, 4);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("directory copy excludes metadata and publishes only selected creates, replacements and explicit deletions", async () => {
  const { root, source, runtime } = await fixture();
  try {
    await writeFile(join(source, "old.json"), "old");
    await writeFile(join(source, "deleted.json"), "delete");
    await writeFile(join(source, "other.txt"), "keep");
    await mkdir(join(source, ".git"));
    await writeFile(join(source, ".git", "config"), "private");
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime,
    });
    await assert.rejects(lstat(join(workspace.directory, ".git")), {
      code: "ENOENT",
    });
    await writeFile(join(workspace.directory, "old.json"), "new");
    await writeFile(join(workspace.directory, "created.json"), "created");
    await rm(join(workspace.directory, "deleted.json"));
    await writeFile(join(source, "appeared.json"), "external");
    assert.equal(await readFile(join(source, "old.json"), "utf8"), "old");
    const result = await publishWorkspaceOutputs(workspace, {
      destination: source,
      paths: ["**/*.json"],
      policy: "update",
      deleteMissing: true,
    });
    assert.equal(result.state, "complete");
    assert.equal(await readFile(join(source, "old.json"), "utf8"), "new");
    assert.equal(
      await readFile(join(source, "created.json"), "utf8"),
      "created",
    );
    assert.equal(
      await readFile(join(source, "appeared.json"), "utf8"),
      "external",
    );
    assert.equal(await readFile(join(source, "other.txt"), "utf8"), "keep");
    await assert.rejects(lstat(join(source, "deleted.json")), {
      code: "ENOENT",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publication refuses external edits before mutation", async () => {
  const { root, source, runtime } = await fixture();
  try {
    await writeFile(join(source, "value.json"), "initial");
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime,
    });
    await writeFile(join(workspace.directory, "value.json"), "agent");
    await writeFile(join(source, "value.json"), "external");
    await assert.rejects(
      publishWorkspaceOutputs(workspace, {
        destination: source,
        paths: ["**/*.json"],
        policy: "update",
      }),
      /destination changed/,
    );
    assert.equal(
      await readFile(join(source, "value.json"), "utf8"),
      "external",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("writable mounts conflict across runtime roots and never remove borrowed sources", async () => {
  const { root, source, runtime } = await fixture();
  try {
    await mkdir(join(source, "nested"));
    const workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "mount", target: "input", readOnly: false },
      },
      runtime,
    });
    await assert.rejects(
      createWorkspace({
        source: {
          kind: "directory",
          directory: join(source, "nested"),
          access: { mode: "mount", target: "data", readOnly: true },
        },
        runtime: { directory: join(root, "other-control") },
      }),
      /active writer/,
    );
    await assert.rejects(
      createSandbox({
        workspace,
        sandboxProvider: createLocalSandboxProvider(),
      }),
      /does not support mount-write/,
    );
    await workspace.close();
    assert.ok((await lstat(source)).isDirectory());
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("snapshots preserve binary files, internal links, empty directories and modes", async () => {
  const { root, source } = await fixture();
  try {
    const bytes = Buffer.from([0, 255, 128, 13, 10]);
    await writeFile(join(source, "binary"), bytes);
    await mkdir(join(source, "empty"), { mode: 0o750 });
    await symlink("binary", join(source, "link"));
    const transporter = createLocalTransport({
      directory: join(root, "storage"),
    });
    const ref = await snapshotWorkspaceFiles(
      transporter,
      source,
      "snapshots/test",
    );
    const restored = join(root, "restored");
    await restoreWorkspaceFiles(transporter, ref, restored);
    assert.equal(
      await workspaceFingerprint(restored),
      await workspaceFingerprint(source),
    );
    assert.deepEqual(await readFile(join(restored, "binary")), bytes);
    assert.ok((await lstat(join(restored, "link"))).isSymbolicLink());
    await symlink("../outside", join(source, "unsafe"));
    await assert.rejects(workspaceFingerprint(source), /escapes selection/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("scripted file dispatch has no Git result fields and repairs reuse one workspace", async () => {
  const { root, runtime } = await fixture();
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime,
    });
    await using sandbox = await createSandbox({
      workspace,
      sandboxProvider: createMemorySandboxProvider(),
      agent: scriptedAgent({
        turns: [
          { text: "first" },
          { text: "DONE", usage: { input: 2, cached: 0, output: 3 } },
        ],
      }),
    });
    const result = await sandbox.dispatch({
      brief: { text: "process files" },
      passes: 2,
      until: "DONE",
    });
    assert.equal(result.completed, true);
    assert.equal(result.turns.length, 2);
    assert.equal(result.workspaceInfo.id, workspace.id);
    assert.equal(result.usage.input, 2);
    assert.ok(!("branch" in result));
    assert.ok(!("commits" in result));
    assert.equal(JSON.parse(result.report()).version, 2);
    await sandbox.close();
    await assert.rejects(
      dispatch({
        workspace,
        sandboxProvider: createMemorySandboxProvider(),
        agent: scriptedAgent({ turns: [{ text: "DONE" }] }),
        brief: { text: "{{ WORK_BRANCH }}" },
      }),
      /branch variables/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publication rolls back after a journal failure without rerunning any commands", async () => {
  const { root, source, runtime } = await fixture();
  try {
    await writeFile(join(source, "value.json"), "previous");
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime,
    });
    await writeFile(join(workspace.directory, "value.json"), "incoming");
    const local = createLocalTransport({ directory: join(root, "journal") });
    let failed = false;
    const transport: Transport = {
      ...local,
      async write(key, bytes, options) {
        const journal = JSON.parse(Buffer.from(bytes).toString());
        if (
          !failed &&
          journal.operations?.some(
            (op: { phase: string }) => op.phase === "installed",
          )
        ) {
          failed = true;
          throw new Error("injected journal failure");
        }
        return local.write(key, bytes, options);
      },
    };
    await assert.rejects(
      publishWorkspaceOutputs(
        workspace,
        { destination: source, paths: ["**/*.json"], policy: "update" },
        transport,
      ),
      (error) =>
        error instanceof Error &&
        "details" in error &&
        typeof error.details === "object" &&
        !!error.details &&
        "state" in error.details &&
        error.details.state === "rolled-back",
    );
    assert.equal(
      await readFile(join(source, "value.json"), "utf8"),
      "previous",
    );
    assert.equal(
      await readFile(join(workspace.directory, "value.json"), "utf8"),
      "incoming",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a destination recreated during installation survives conditional rollback", async () => {
  const { root, source, runtime } = await fixture();
  try {
    await writeFile(join(source, "value.json"), "previous");
    await using workspace = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runtime,
    });
    await writeFile(join(workspace.directory, "value.json"), "incoming");
    const local = createLocalTransport({ directory: join(root, "journal") });
    let changed = false;
    const transport: Transport = {
      ...local,
      async write(key, bytes, options) {
        const journal = JSON.parse(Buffer.from(bytes).toString());
        const entry = await local.write(key, bytes, options);
        if (
          !changed &&
          journal.operations?.some(
            (op: { phase: string }) => op.phase === "install-intent",
          )
        ) {
          changed = true;
          await writeFile(join(source, "value.json"), "external", {
            flag: "wx",
          });
        }
        return entry;
      },
    };
    await assert.rejects(
      publishWorkspaceOutputs(
        workspace,
        { destination: source, paths: ["**/*.json"], policy: "update" },
        transport,
      ),
      (error) =>
        error instanceof Error &&
        "details" in error &&
        typeof error.details === "object" &&
        !!error.details &&
        "state" in error.details &&
        error.details.state === "recovery-required",
    );
    assert.equal(
      await readFile(join(source, "value.json"), "utf8"),
      "external",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("local resume refuses lost or modified settled workspaces", async () => {
  const { root, runtime } = await fixture();
  try {
    const workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime,
    });
    await writeFile(join(workspace.directory, "saved"), "settled");
    const record = await workspace.checkpoint();
    await workspace.close({ preserve: true });
    const resumed = await restoreFileWorkspace(record);
    assert.equal(resumed.id, record.id);
    const resumedRecord = await resumed.checkpoint();
    await resumed.close({ preserve: true });
    await writeFile(join(workspace.directory, "saved"), "interrupted");
    await assert.rejects(
      restoreFileWorkspace(resumedRecord),
      /explicit recovery/,
    );
    await rm(workspace.directory, { recursive: true });
    await assert.rejects(restoreFileWorkspace(resumedRecord));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("portable resume uses another materialization and still refuses an unavailable mounted source", async () => {
  const { root, runtime, source } = await fixture();
  try {
    const transporter = createLocalTransport({
      directory: join(root, "storage"),
    });
    const retention = { policy: "portable" as const, transporter };
    const workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { ...runtime, namespace: "portable" },
      retention,
    });
    await writeFile(join(workspace.directory, "saved"), "portable bytes");
    const record = await workspace.checkpoint();
    await workspace.close({ preserve: true });
    await rm(workspace.directory, { recursive: true });
    await using resumed = await restoreFileWorkspace(record, {
      portable: true,
      runtime: { directory: join(root, "worker-two"), namespace: "portable" },
      retention,
    });
    assert.notEqual(resumed.directory, record.directory);
    assert.equal(
      await readFile(join(resumed.directory, "saved"), "utf8"),
      "portable bytes",
    );
    const mounted = await createWorkspace({
      source: {
        kind: "directory",
        directory: source,
        access: { mode: "mount", target: "input", readOnly: true },
      },
      runtime: { ...runtime, namespace: "portable" },
      retention,
    });
    const mountedRecord = await mounted.checkpoint();
    await mounted.close({ preserve: true });
    await rm(source, { recursive: true });
    await assert.rejects(
      restoreFileWorkspace(mountedRecord, {
        portable: true,
        runtime: {
          directory: join(root, "worker-three"),
          namespace: "portable",
        },
        retention,
      }),
      /unavailable/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("configuration 3 executes and publishes an ephemeral recipe without Git", async () => {
  const { root } = await fixture();
  try {
    const file = join(root, "recipe.yaml"),
      config = join(root, "outpost.yaml");
    await writeFile(
      file,
      JSON.stringify({
        version: 3,
        name: "files",
        tasks: [
          {
            key: "produce",
            command: {
              executable: process.execPath,
              arguments: [
                "-e",
                "require('fs').writeFileSync('result.json','{}')",
              ],
            },
          },
        ],
      }),
    );
    await writeFile(
      config,
      JSON.stringify({
        version: 3,
        workspace: { kind: "ephemeral" },
        sandbox: { provider: "local" },
        outputs: [
          {
            paths: ["**/*.json"],
            destination: "./published",
            policy: "create",
          },
        ],
      }),
    );
    assert.equal(
      (await validateRecipeProject({ file, config })).configurationVersion,
      3,
    );
    await using runtime = await createRecipeRuntime({ file, config });
    const report = await runtime.run();
    assert.equal(report.status, "done", JSON.stringify(report.errors));
    assert.equal(report.workspace, undefined);
    assert.equal(report.workspaceInfo?.kind, "ephemeral");
    assert.equal(
      await readFile(join(root, "published", "result.json"), "utf8"),
      "{}",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("configuration 3 keeps files across a durable pause without replaying completed commands", async () => {
  const { root } = await fixture();
  try {
    const file = join(root, "recipe.yaml"),
      config = join(root, "outpost.yaml");
    await writeFile(
      file,
      JSON.stringify({
        version: 3,
        name: "durable-files",
        workflow: {
          checkpoint: {
            store: { $ref: "stores.checkpoint" },
            runId: "files-run",
            version: "1",
          },
        },
        tasks: [
          {
            key: "produce",
            command: {
              executable: process.execPath,
              arguments: [
                "-e",
                "require('fs').appendFileSync('result.json','one')",
              ],
            },
          },
          {
            key: "approve",
            after: ["produce"],
            gate: {
              kind: "approval",
              prompt: "Continue?",
              actors: ["maintainer"],
            },
          },
          {
            key: "finish",
            after: ["approve"],
            command: {
              executable: process.execPath,
              arguments: [
                "-e",
                "if(require('fs').readFileSync('result.json','utf8')!=='one')process.exit(8)",
              ],
            },
          },
        ],
      }),
    );
    await writeFile(
      config,
      JSON.stringify({
        version: 3,
        workspace: { kind: "ephemeral" },
        sandbox: { provider: "local" },
        transports: { state: { type: "local", directory: "./storage" } },
        stores: {
          checkpoint: {
            type: "transport",
            transporter: { $ref: "transports.state" },
          },
        },
        outputs: [
          {
            paths: ["**/*.json"],
            destination: "./published",
            policy: "create",
          },
        ],
      }),
    );
    const runtime = await createRecipeRuntime({ file, config });
    const paused = await runtime.run();
    assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
    assert.equal(
      await readFile(
        join(paused.workspaceInfo!.directory, "result.json"),
        "utf8",
      ),
      "one",
    );
    await runtime.close();
    await using resumed = await createRecipeRuntime({ file, config });
    const status = await resumed.status("files-run");
    assert.equal(
      status?.workspaces.shared?.fileRecord?.id,
      paused.workspaceInfo!.id,
    );
    const report = await resumed.resume({
      runId: "files-run",
      decisions: [
        {
          executionId: paused.executionId!,
          key: "approve",
          requestId: paused.tasks.find((task) => task.key === "approve")!.pause!
            .id,
          actor: "maintainer",
          action: "approve",
          reason: "Reviewed",
        },
      ],
    });
    assert.equal(report.status, "done", JSON.stringify(report.errors));
    assert.equal(
      report.tasks.find((task) => task.key === "produce")?.attempts,
      1,
    );
    assert.equal(
      await readFile(join(root, "published", "result.json"), "utf8"),
      "one",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
