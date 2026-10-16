import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { openWorkspace } from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { inside } from "../../src/infrastructure/files.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { repository } from "../helpers.ts";

for (const failure of ["upload", "cancel", "patch"] as const) {
  test(`failed remote initialization removes its own recovery files (${failure})`, async (t) => {
    const root = await repository(t);
    const workspace = await openWorkspace({ repository: root });
    t.after(() => workspace.close({ preserve: true }));
    const recovery = join(root, ".outpost", "recovery");
    const remote = join(recovery, "remote");
    await mkdir(remote, { recursive: true });
    const retained = join(recovery, "retained");
    await mkdir(retained);
    await writeFile(join(retained, "state.json"), "keep");
    await writeFile(join(root, "base.txt"), "host draft");
    const local = await createLocalSandboxProvider().acquire({
      repository: remote,
      directory: remote,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => local.release());
    const controller = new AbortController();
    const fault = new Error("Seed transfer failed");
    let attempted = false;
    await assert.rejects(
      seedRemote(
        workspace,
        {
          ...local,
          async upload(...args) {
            if (failure === "patch" && !args[0].endsWith(".patch"))
              return local.upload(...args);
            assert.ok((await readFile(args[0])).length > 0);
            attempted = true;
            if (failure === "cancel") controller.abort(fault);
            throw fault;
          },
        },
        { includeUncommitted: true, signal: controller.signal },
      ),
      (error: unknown) => error === fault,
    );
    assert.equal(attempted, true);
    assert.deepEqual((await readdir(recovery)).sort(), ["remote", "retained"]);
    assert.equal(await readFile(join(retained, "state.json"), "utf8"), "keep");
    assert.equal(await readFile(join(root, "base.txt"), "utf8"), "host draft");
  });
}

for (const location of ["host", "remote"] as const) {
  test(`nested untracked repositories are refused explicitly on the ${location}`, async (t) => {
    const root = await repository(t);
    const workspace = await openWorkspace({ repository: root });
    t.after(() => workspace.close({ preserve: true }));
    const remote = join(root, ".outpost", "recovery", "nested-remote");
    await mkdir(remote, { recursive: true });
    const lease = await createLocalSandboxProvider().acquire({
      repository: remote,
      directory: remote,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => lease.release());
    const nested = join(location === "host" ? root : remote, "vendor clone");
    const createNested = async () => {
      await mkdir(nested);
      await git(nested, ["init"]);
      await writeFile(join(nested, "keep.txt"), "nested work");
    };
    const refused = (error: unknown) => {
      const fault = location === "host" ? error : (error as Error).cause;
      assert.ok(fault instanceof OutpostError);
      assert.equal(fault.code, "conflict");
      assert.equal(fault.details.file, "vendor clone/");
      assert.match(fault.message, /nested.*repositor/i);
      return true;
    };
    if (location === "host") {
      await createNested();
      for (const includeUncommitted of [false, true])
        await assert.rejects(
          seedRemote(workspace, lease, { includeUncommitted }),
          refused,
        );
      await assert.rejects(readFile(join(remote, "base.txt")), {
        code: "ENOENT",
      });
    } else {
      const sync = await seedRemote(workspace, lease);
      t.after(() => sync.close());
      await createNested();
      await writeFile(join(remote, "base.txt"), "remote edit");
      await assert.rejects(sync.pull(), refused);
      assert.equal(await readFile(join(root, "base.txt"), "utf8"), "base\n");
      await rm(nested, { recursive: true });
      await sync.pull();
      assert.equal(
        await readFile(join(root, "base.txt"), "utf8"),
        "remote edit",
      );
      return;
    }
    assert.equal(
      await readFile(join(nested, "keep.txt"), "utf8"),
      "nested work",
    );
  });
}

for (const committed of [false, true]) {
  for (const runtimePath of [
    ".outpost/cache/file.txt",
    ".outpost/storage/file.txt",
  ]) {
    test(`remote runtime paths are refused before host mutation (${runtimePath}, committed: ${committed})`, async (t) => {
      const root = await repository(t);
      const workspace = await openWorkspace({ repository: root });
      t.after(() => workspace.close({ preserve: true }));
      const remote = join(root, ".outpost", "recovery", "runtime-remote");
      await mkdir(remote, { recursive: true });
      const lease = await createLocalSandboxProvider().acquire({
        repository: remote,
        directory: remote,
        gitDirectories: [],
        variables: {},
      });
      t.after(() => lease.release());
      const sync = await seedRemote(workspace, lease);
      t.after(() => sync.close());
      await writeFile(join(remote, ".git", "info", "exclude"), "");
      const before = await git(root, ["rev-parse", "HEAD"]);
      await mkdir(dirname(join(remote, runtimePath)), { recursive: true });
      await writeFile(join(remote, runtimePath), "incoming runtime state");
      await writeFile(join(remote, "base.txt"), "remote changes");
      if (committed) {
        await git(remote, ["add", "-f", runtimePath, "base.txt"]);
        await git(remote, ["commit", "-m", "Runtime state"]);
      }
      await assert.rejects(sync.pull(), (error) => {
        assert.match(String((error as Error).cause), /Outpost runtime state/);
        return true;
      });
      assert.equal(await git(root, ["rev-parse", "HEAD"]), before);
      assert.equal(await git(root, ["diff", "HEAD"]), "");
      await assert.rejects(readFile(join(root, runtimePath)), {
        code: "ENOENT",
      });
    });
  }
}

test("committed remote additions cannot overwrite ignored host files", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, ".gitignore"), "secret.env\nprivate/\n");
  await git(root, ["add", ".gitignore"]);
  await git(root, ["commit", "-m", "Ignore private files"]);
  const workspace = await openWorkspace({ repository: root });
  t.after(() => workspace.close({ preserve: true }));
  await writeFile(join(root, "secret.env"), "host secret");
  const before = await git(root, ["rev-parse", "HEAD"]);
  const remote = join(root, ".outpost", "recovery", "ignored-remote");
  await mkdir(remote, { recursive: true });
  const lease = await createLocalSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const sync = await seedRemote(workspace, lease);
  t.after(() => sync.close());
  await writeFile(join(remote, "secret.env"), "remote replacement");
  await git(remote, ["add", "-f", "secret.env"]);
  await git(remote, ["commit", "-m", "Force-add ignored path"]);
  await assert.rejects(sync.pull(), (error) => {
    assert.match(String((error as Error).cause), /overlap ignored host files/);
    return true;
  });
  assert.equal(await readFile(join(root, "secret.env"), "utf8"), "host secret");
  assert.equal(await git(root, ["rev-parse", "HEAD"]), before);
});

for (const [hostPath, remotePath] of [
  ["private", "private/file.txt"],
  ["private/secret.txt", "private"],
] as const) {
  test(`remote synchronization protects ignored collision ${hostPath} against ${remotePath}`, async (t) => {
    const root = await repository(t);
    await writeFile(join(root, ".gitignore"), "private\n");
    await git(root, ["add", ".gitignore"]);
    await git(root, ["commit", "-m", "Ignore private state"]);
    const workspace = await openWorkspace({ repository: root });
    t.after(() => workspace.close({ preserve: true }));
    await mkdir(dirname(join(root, hostPath)), { recursive: true });
    await writeFile(join(root, hostPath), "host state");
    const before = await git(root, ["rev-parse", "HEAD"]);
    const remote = join(root, ".outpost", "recovery", "collision-remote");
    await mkdir(remote, { recursive: true });
    const lease = await createLocalSandboxProvider().acquire({
      repository: remote,
      directory: remote,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => lease.release());
    const sync = await seedRemote(workspace, lease);
    t.after(() => sync.close());
    await mkdir(dirname(join(remote, remotePath)), { recursive: true });
    await writeFile(join(remote, remotePath), "remote state");
    await git(remote, ["add", "-f", remotePath]);
    await git(remote, ["commit", "-m", "Replace ignored state"]);
    await assert.rejects(sync.pull(), (error) => {
      assert.match(
        String((error as Error).cause),
        /overlap ignored host files/,
      );
      return true;
    });
    assert.equal(await readFile(join(root, hostPath), "utf8"), "host state");
    assert.equal(await git(root, ["rev-parse", "HEAD"]), before);
  });
}

test("remote synchronization preserves commit identity and handles repeated dirty-to-committed transitions", async (t) => {
  const root = await repository(t),
    workspace = await openWorkspace({
      repository: root,
      branch: { mode: "named", name: "remote-work" },
    });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const lease = await createLocalSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  await writeFile(join(workspace.directory, "base.txt"), "host dirty\n");
  await writeFile(join(workspace.directory, "extra.txt"), "initial");
  const sync = await seedRemote(workspace, lease, { includeUncommitted: true });
  assert.equal(
    await readFile(join(remote, "base.txt"), "utf8"),
    "host dirty\n",
  );
  await writeFile(join(remote, "base.txt"), "first remote edit\n");
  await writeFile(join(remote, "extra.txt"), "remote extra");
  await sync.pull();
  assert.equal(
    await readFile(join(workspace.directory, "extra.txt"), "utf8"),
    "remote extra",
  );
  await git(remote, ["add", "."]);
  await git(remote, ["commit", "-m", "Remote authored commit"]);
  const oid = (await git(remote, ["rev-parse", "HEAD"])).trim();
  await writeFile(join(remote, "base.txt"), "next edit\n");
  await writeFile(join(remote, "later.txt"), "later");
  await sync.pull();
  await sync.pull();
  assert.equal(
    (await git(workspace.directory, ["rev-parse", "HEAD"])).trim(),
    oid,
  );
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "next edit\n",
  );
  assert.equal(
    await readFile(join(workspace.directory, "later.txt"), "utf8"),
    "later",
  );
  await rm(join(remote, "later.txt"));
  await sync.pull();
  await assert.rejects(readFile(join(workspace.directory, "later.txt")));
  await writeFile(
    join(workspace.directory, "base.txt"),
    "concurrent host edit\n",
  );
  await assert.rejects(sync.pull(), (error) => {
    assert.match(String((error as Error).cause), /Host workspace changed/);
    return true;
  });
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "concurrent host edit\n",
  );
});

test("remote seeds only commits, preserves unrelated staged and untracked files, and rejects overlap before mutation", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "committed-only" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "committed-remote");
  await mkdir(remote, { recursive: true });
  const lease = await createLocalSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  await writeFile(join(workspace.directory, "base.txt"), "private draft\n");
  await git(workspace.directory, ["add", "base.txt"]);
  await writeFile(join(workspace.directory, "private.txt"), "host only");
  const sync = await seedRemote(workspace, lease);
  t.after(() => sync.close());
  assert.notEqual(
    await readFile(join(remote, "base.txt"), "utf8"),
    "private draft\n",
  );
  await assert.rejects(readFile(join(remote, "private.txt")));
  await writeFile(join(remote, "feature.txt"), "feature\n");
  await git(remote, ["add", "feature.txt"]);
  await git(remote, ["commit", "-m", "Remote feature"]);
  await sync.pull();
  await sync.pull();
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "private draft\n",
  );
  assert.equal(
    await readFile(join(workspace.directory, "private.txt"), "utf8"),
    "host only",
  );
  assert.match(
    await git(workspace.directory, ["diff", "--cached"]),
    /private draft/,
  );
  const before = await git(workspace.directory, ["rev-parse", "HEAD"]);
  await writeFile(join(remote, "base.txt"), "conflicting remote edit\n");
  await assert.rejects(sync.pull(), (error) => {
    assert.match(String((error as Error).cause), /overlap uncommitted host/);
    return true;
  });
  assert.equal(await git(workspace.directory, ["rev-parse", "HEAD"]), before);
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "private draft\n",
  );
});

test("remote synchronization keeps transfer files inside the sandbox root", async (t) => {
  const root = await repository(t),
    workspace = await openWorkspace({
      repository: root,
      branch: { mode: "named", name: "confined-sync" },
    });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const local = await createLocalSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => local.release());
  // Like a microVM user who may write only below its workspace root.
  const confined = (path: string) => {
    if (!inside(remote, path))
      throw new Error(`EACCES: permission denied, open '${path}'`);
  };
  const lease = {
    ...local,
    upload: async (...args: Parameters<typeof local.upload>) => {
      confined(args[1]);
      await local.upload(...args);
    },
    download: async (...args: Parameters<typeof local.download>) => {
      confined(args[0]);
      await local.download(...args);
    },
  };
  await writeFile(join(workspace.directory, "base.txt"), "host dirty\n");
  const sync = await seedRemote(workspace, lease, { includeUncommitted: true });
  t.after(() => sync.close());
  assert.equal(
    await readFile(join(remote, "base.txt"), "utf8"),
    "host dirty\n",
  );
  await git(remote, ["commit", "-am", "Remote commit"]);
  const oid = (await git(remote, ["rev-parse", "HEAD"])).trim();
  await sync.pull();
  assert.equal(
    (await git(workspace.directory, ["rev-parse", "HEAD"])).trim(),
    oid,
  );
  assert.equal(await git(remote, ["status", "--porcelain", "--ignored"]), "");
});
