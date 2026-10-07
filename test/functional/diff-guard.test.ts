import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  attach,
  createObservationHub,
  createSandbox,
  defineIsolatedTask,
  defineWorkflow,
  dispatch,
  openWorkspace,
  OutpostError,
  recoveryDetails,
} from "../../src/index.ts";
import type {
  DiffGuard,
  ObservationHub,
  SandboxProvider,
  Workspace,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { emit, repository, scripted } from "../helpers.ts";

async function commit(
  directory: string,
  path: string,
  content: string | Uint8Array,
) {
  await mkdir(dirname(join(directory, path)), { recursive: true });
  await writeFile(join(directory, path), content);
  await git(directory, ["add", "--", path]);
  await git(directory, ["commit", "-m", "Change"]);
}

function change(path: string, content = "one\ntwo\n") {
  return scripted(
    `import {mkdirSync,writeFileSync} from 'node:fs';import {dirname} from 'node:path';import {execFileSync} from 'node:child_process'; const path=${JSON.stringify(path)};mkdirSync(dirname(path),{recursive:true});writeFileSync(path,${JSON.stringify(content)});execFileSync('git',['add','--',path]);execFileSync('git',['commit','-m','Change']);${emit("done")}`,
  );
}

function refused(error: unknown): error is OutpostError {
  assert.ok(error instanceof OutpostError);
  assert.equal(error.code, "guard");
  assert.equal(typeof error.details.branch, "string");
  assert.equal(typeof error.details.directory, "string");
  return true;
}

for (const mode of ["named", "integrate"] as const) {
  test(`guarded ${mode} dispatch accepts the threshold and retains rejected work`, async (t) => {
    const root = await repository(t);
    const result = await dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      branch: mode === "named" ? { mode, name: "accepted" } : { mode },
      guard: { maxChangedLines: 2 },
      agent: change("allowed.txt"),
      brief: { text: "change" },
    });
    const host = (await git(root, ["rev-parse", "HEAD"])).trim();
    if (mode === "integrate")
      assert.equal(
        await readFile(join(root, "allowed.txt"), "utf8"),
        "one\ntwo\n",
      );
    const retained: OutpostError[] = [];
    for (const guard of [
      { protectedPaths: [".github/**"] },
      { maxChangedLines: 1 },
    ] satisfies DiffGuard[]) {
      await assert.rejects(
        dispatch({
          repository: root,
          sandboxProvider: createLocalSandboxProvider(),
          logging: false,
          branch:
            mode === "named"
              ? { mode, name: `refused-${retained.length}` }
              : { mode },
          guard,
          agent: change(".github/job.yml"),
          brief: { text: "change" },
        }),
        (error) => {
          assert.ok(refused(error));
          retained.push(error);
          return true;
        },
      );
    }
    for (const error of retained) {
      const recovery = recoveryDetails(error);
      assert.equal(recovery?.branch, error.details.branch);
      const directory = String(error.details.directory);
      await access(directory);
      assert.equal(
        await readFile(join(directory, ".github/job.yml"), "utf8"),
        "one\ntwo\n",
      );
      assert.equal(
        (await git(root, ["rev-parse", String(error.details.branch)])).trim(),
        (await git(directory, ["rev-parse", "HEAD"])).trim(),
      );
      await using reopened = await openWorkspace({
        repository: root,
        branch: { mode: "named", name: String(error.details.branch) },
      });
      assert.equal(reopened.directory, directory);
    }
    assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
    await assert.rejects(access(join(root, ".github/job.yml")));
    assert.ok(result.commits.length);
  });
}

test("guards reject current and supplied-workspace overrides before sandbox allocation", async (t) => {
  const root = await repository(t);
  let allocated = false;
  const provider: SandboxProvider = {
    name: "unexpected",
    placement: "host",
    async acquire() {
      allocated = true;
      throw new Error("must not allocate");
    },
  };
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: provider,
      agent: change("file"),
      brief: { text: "change" },
      guard: { maxChangedLines: 1 },
    }),
    (error) => error instanceof OutpostError && error.code === "configuration",
  );
  await using workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "owned" },
  });
  await assert.rejects(
    createSandbox({ workspace, guard: {}, sandboxProvider: provider }),
    /supplied workspace owns/i,
  );
  assert.equal(allocated, false);
});

test("warm guards accumulate the final committed diff, exclude dirty files and survive closure", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "warm" },
    guard: { protectedPaths: ["private/**"], maxChangedLines: 2 },
  });
  const box = await workspace.sandbox({
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  await box.dispatch({
    agent: change("first.txt", "one\n"),
    brief: { text: "first" },
  });
  await box.dispatch({
    agent: change("second.txt", "two\n"),
    brief: { text: "second" },
  });
  await box.dispatch({
    agent: scripted(
      `import {mkdirSync,writeFileSync} from 'node:fs';mkdirSync('private');writeFileSync('private/dirty.txt','dirty');${emit("dirty")}`,
    ),
    brief: { text: "dirty" },
  });
  await assert.rejects(
    box.dispatch({
      agent: change("third.txt", "three\n"),
      brief: { text: "third" },
    }),
    refused,
  );
  assert.equal(
    (
      await box.command({
        executable: process.execPath,
        arguments: ["-e", "console.log('usable')"],
      })
    ).stdout.trim(),
    "usable",
  );
  await box.close();
  assert.equal(
    (await workspace.close()).retainedDirectory,
    workspace.directory,
  );
  await access(workspace.directory);
});

test("final diff permits changes restored by a later commit and counts added plus removed lines", async (t) => {
  const root = await repository(t);
  await using workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: { protectedPaths: ["base.txt"], maxChangedLines: 0 },
  });
  await commit(workspace.directory, "base.txt", "changed\n");
  await commit(workspace.directory, "base.txt", "base\n");
  await workspace.integrate();
  assert.equal(await readFile(join(root, "base.txt"), "utf8"), "base\n");
  const second = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: { maxChangedLines: 1 },
  });
  await commit(second.directory, "base.txt", "replacement\n");
  await assert.rejects(second.integrate(), (error) => {
    assert.ok(refused(error));
    assert.equal(error.details.changedLines, 2);
    return true;
  });
  assert.equal((await second.close()).retainedDirectory, second.directory);
});

test("integration guards include inherited commits and exclude independent host changes", async (t) => {
  const root = await repository(t);
  await git(root, ["checkout", "-b", "inherited"]);
  await commit(root, "private/config", "secret\n");
  await git(root, ["checkout", "main"]);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate", from: "inherited" },
    guard: { protectedPaths: ["private/**"] },
  });
  await assert.rejects(workspace.integrate(), refused);
  await workspace.close();
  await using clean = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: { protectedPaths: ["private/**"], maxChangedLines: 1 },
  });
  await commit(clean.directory, "allowed.txt", "one\n");
  await commit(root, "private/host-only", "host\n");
  await clean.integrate();
  assert.equal(await readFile(join(root, "allowed.txt"), "utf8"), "one\n");
});

test("renames consume no lines and check old and new paths including unusual names", async (t) => {
  const root = await repository(t);
  const oldPath =
    process.platform === "win32"
      ? "private/old space.txt"
      : "private/old\nspace\t.txt";
  const newPath = "public/new space.txt";
  await commit(root, oldPath, "line\n".repeat(12));
  for (const protectedPaths of [["private/**"], ["public/**"], []]) {
    const workspace = await openWorkspace({
      repository: root,
      branch: { mode: "integrate" },
      guard: { protectedPaths, maxChangedLines: 0 },
    });
    await mkdir(join(workspace.directory, "public"));
    await git(workspace.directory, ["mv", "--", oldPath, newPath]);
    await git(workspace.directory, ["commit", "-m", "Rename"]);
    if (protectedPaths.length) {
      await assert.rejects(workspace.integrate(), (error) => {
        assert.ok(refused(error));
        assert.equal(error.details.changedLines, 0);
        assert.deepEqual(error.details.matches, [
          {
            path: protectedPaths[0] === "private/**" ? oldPath : newPath,
            pattern: protectedPaths[0],
          },
        ]);
        return true;
      });
      assert.equal(
        (await workspace.close()).retainedDirectory,
        workspace.directory,
      );
      continue;
    }
    await workspace.integrate();
    await workspace.close();
    await access(join(root, newPath));
  }
});

test("binary changes require a countable diff only when a line limit exists", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: { maxChangedLines: 800 },
  });
  await commit(workspace.directory, "image.bin", Buffer.from([0, 1, 2, 3]));
  await assert.rejects(workspace.integrate(), (error) => {
    assert.ok(refused(error));
    assert.deepEqual(error.details.binaryPaths, ["image.bin"]);
    return true;
  });
  await workspace.close();
  await using permitted = await openWorkspace({
    repository: root,
    branch: { mode: "integrate", from: workspace.branch },
    guard: { protectedPaths: ["private/**"] },
  });
  await permitted.integrate();
  assert.deepEqual(
    await readFile(join(root, "image.bin")),
    Buffer.from([0, 1, 2, 3]),
  );
});

test("attach checks guards on successful cold and warm terminal sessions", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    attach({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      branch: { mode: "integrate" },
      guard: { protectedPaths: ["private/**"] },
      agent: change("private/terminal"),
    }),
    refused,
  );
  const box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    branch: { mode: "named", name: "terminal" },
    guard: { maxChangedLines: 0 },
    logging: false,
  });
  await assert.rejects(box.attach({ agent: change("terminal") }), refused);
  assert.equal((await box.close()).retainedDirectory, box.workspace.directory);
});

test("isolated tasks propagate guard termination and recovery without merging", async (t) => {
  const root = await repository(t);
  const task = defineIsolatedTask({
    key: "guarded",
    request: () => ({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      branch: { mode: "integrate" },
      guard: { maxChangedLines: 0 },
      agent: change("task.txt"),
      brief: { text: "task" },
    }),
  });
  const result = await defineWorkflow("guarded", [task]).start();
  assert.equal(result.status, "failed");
  assert.equal(result.terminationCode, "guard");
  await assert.rejects(access(join(root, "task.txt")));
});

test("remote changes are synchronized before their committed diff is refused", async (t) => {
  const root = await repository(t);
  const remote = join(root, ".outpost", "fake-remote");
  await mkdir(remote, { recursive: true });
  let released = false;
  const provider: SandboxProvider = {
    name: "fake-remote",
    placement: "remote",
    async acquire() {
      const lease = await createLocalSandboxProvider().acquire({
        repository: remote,
        directory: remote,
        gitDirectories: [],
        variables: {},
      });
      return {
        ...lease,
        async release() {
          await lease.release();
          released = true;
        },
      };
    },
  };
  let directory = "";
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: provider,
      bootstrap: false,
      logging: false,
      branch: { mode: "integrate" },
      guard: { protectedPaths: ["private/**"] },
      agent: change("private/remote.txt"),
      brief: { text: "remote" },
    }),
    (error) => {
      assert.ok(refused(error));
      directory = String(error.details.directory);
      return true;
    },
  );
  assert.equal(
    await readFile(join(directory, "private/remote.txt"), "utf8"),
    "one\ntwo\n",
  );
  await assert.rejects(access(join(root, "private/remote.txt")));
  assert.equal(released, true);
});

for (const target of ["candidate", "host"] as const) {
  test(`integration refuses a ${target} ref changed after inspection and releases its lock`, async (t) => {
    const root = await repository(t);
    const hub = createObservationHub();
    let workspace: Workspace | undefined;
    let advanced = false;
    const observation: ObservationHub = {
      ...hub,
      emit(source, event) {
        hub.emit(source, event);
        if (
          event.kind !== "operation" ||
          event.name !== "diff.guard" ||
          event.status !== "finished" ||
          advanced ||
          !workspace
        )
          return;
        advanced = true;
        execFileSync(
          "git",
          [
            "-c",
            `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
            "commit",
            "--allow-empty",
            "-m",
            "Concurrent",
          ],
          {
            cwd: target === "host" ? root : workspace.directory,
            stdio: "pipe",
          },
        );
      },
    };
    workspace = await openWorkspace({
      repository: root,
      branch: { mode: "integrate" },
      guard: { maxChangedLines: 1 },
      observation,
    });
    await commit(workspace.directory, "candidate.txt", "one\n");
    await assert.rejects(workspace.integrate(), (error) => {
      assert.ok(refused(error));
      assert.deepEqual(error.details.reasons, ["references-changed"]);
      return true;
    });
    assert.equal(
      (await workspace.close()).retainedDirectory,
      workspace.directory,
    );
    await using next = await openWorkspace({
      repository: root,
      branch: { mode: "integrate" },
      guard: {},
    });
    await next.integrate();
    await hub.close();
  });
}

test("unreadable candidate inspection fails closed and preserves its workspace", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: {},
  });
  await git(workspace.directory, ["checkout", "--detach"]);
  await assert.rejects(workspace.integrate(), refused);
  assert.equal(
    (await workspace.close()).retainedDirectory,
    workspace.directory,
  );
});

test("guard configuration is copied and manual integration rechecks changes after a successful run", async (t) => {
  const root = await repository(t);
  const protectedPaths = ["private/**"];
  const guard = { protectedPaths, maxChangedLines: 2 };
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard,
  });
  protectedPaths.length = 0;
  guard.maxChangedLines = 100;
  const box = await workspace.sandbox({
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  await box.dispatch({
    agent: change("allowed", "one\n"),
    brief: { text: "allowed" },
  });
  await box.close();
  await commit(workspace.directory, "private/late", "late\n");
  await assert.rejects(workspace.integrate(), refused);
  assert.equal(
    (await workspace.close()).retainedDirectory,
    workspace.directory,
  );
  await assert.rejects(access(join(root, "allowed")));
});

test("reference verification errors after inspection are guard faults and preserve work", async (t) => {
  const root = await repository(t);
  const hub = createObservationHub();
  let workspace: Workspace | undefined;
  const observation: ObservationHub = {
    ...hub,
    emit(source, event) {
      hub.emit(source, event);
      if (
        !workspace ||
        event.kind !== "operation" ||
        event.name !== "diff.guard" ||
        event.status !== "finished"
      )
        return;
      execFileSync("git", ["checkout", "--detach"], {
        cwd: workspace.directory,
        stdio: "pipe",
      });
    },
  };
  workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    guard: {},
    observation,
  });
  await assert.rejects(workspace.integrate(), (error) => {
    assert.ok(refused(error));
    assert.deepEqual(error.details.reasons, ["inspection"]);
    assert.ok(error.cause instanceof OutpostError);
    return true;
  });
  assert.equal(
    (await workspace.close()).retainedDirectory,
    workspace.directory,
  );
  await hub.close();
});

test("failed agent turns retain their process fault instead of applying the guard", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    dispatch({
      repository: root,
      branch: { mode: "named", name: "failed" },
      guard: { maxChangedLines: 0 },
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
      agent: scripted("process.exit(7)"),
      brief: { text: "fail" },
    }),
    (error) => error instanceof OutpostError && error.code === "process",
  );
});
