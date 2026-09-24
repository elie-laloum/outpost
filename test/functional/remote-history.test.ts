import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import {
  openWorkspace,
  OutpostError,
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { git } from "../../src/infrastructure/git.ts";
import { local } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

async function fixture(t: TestContext) {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "history" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const lease = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  return { root, workspace, remote, lease };
}

async function commit(
  directory: string,
  name: string,
  contents: string | Buffer,
) {
  await writeFile(join(directory, name), contents);
  await git(directory, ["add", name]);
  await git(directory, ["commit", "-m", name]);
  return (await git(directory, ["rev-parse", "HEAD"])).trim();
}

function prerequisites(bundle: Buffer): string[] {
  return bundle
    .subarray(0, bundle.indexOf("\n\n"))
    .toString()
    .split("\n")
    .filter((line) => line.startsWith("-"));
}

async function metadata(directory: string) {
  const path = (name: string) =>
    git(directory, ["rev-parse", "--path-format=absolute", "--git-path", name]);
  return {
    head: await git(directory, ["rev-parse", "HEAD"]),
    index: await readFile((await path("index")).trim()),
    fetch: await readFile((await path("FETCH_HEAD")).trim()).catch(
      () => undefined,
    ),
    worktrees: await git(directory, ["worktree", "list", "--porcelain"]),
  };
}

test("large fresh history is complete; preseeded history and successive pulls transfer only new objects", async (t) => {
  const { workspace, remote, lease } = await fixture(t);
  for (let i = 0; i < 4; i++)
    await commit(workspace.directory, `large-${i}`, randomBytes(256 * 1024));
  const uploads: Buffer[] = [],
    downloads: Buffer[] = [];
  const observed = {
    ...lease,
    upload: async (...args: Parameters<typeof lease.upload>) => {
      if (args[0].endsWith(".bundle")) uploads.push(await readFile(args[0]));
      await lease.upload(...args);
    },
    download: async (...args: Parameters<typeof lease.download>) => {
      await lease.download(...args);
      if (args[1].endsWith(".bundle")) downloads.push(await readFile(args[1]));
    },
  };
  const first = await seedRemote(workspace, observed);
  await first.close();
  assert.equal(prerequisites(uploads[0]!).length, 0);
  assert.ok(uploads[0]!.length > 1024 * 1024);
  await commit(workspace.directory, "host-new", "small update");
  const sync = await seedRemote(workspace, observed);
  t.after(() => sync.close());
  assert.equal(prerequisites(uploads[1]!).length, 1);
  assert.ok(uploads[1]!.length < uploads[0]!.length / 10);
  assert.equal(
    await git(remote, ["rev-parse", "HEAD"]),
    await git(workspace.directory, ["rev-parse", "HEAD"]),
  );
  for (let i = 0; i < 3; i++) {
    const previous = (await git(remote, ["rev-parse", "HEAD"])).trim();
    const head = await commit(remote, `remote-${i}`, `new ${i}`);
    await sync.pull();
    assert.match(prerequisites(downloads[i]!)[0]!, new RegExp(previous));
    assert.ok(downloads[i]!.length < uploads[0]!.length / 10);
    assert.equal(
      (await git(workspace.directory, ["rev-parse", "HEAD"])).trim(),
      head,
    );
    assert.equal(
      await git(workspace.directory, ["show", `HEAD:remote-${i}`]),
      `new ${i}`,
    );
  }
  await sync.pull();
  assert.equal(downloads.length, 3);
  const repeated = await seedRemote(workspace, observed);
  await repeated.close();
  assert.equal(
    uploads.length,
    2,
    "identical preseeded HEAD needs no history upload",
  );
});

test("missing preseed objects and unrelated preseed history fall back to complete uploads", async (t) => {
  for (const mode of ["missing", "unrelated"]) {
    const { workspace, remote, lease } = await fixture(t);
    const initial = await seedRemote(workspace, lease);
    await initial.close();
    if (mode === "missing") {
      await commit(remote, "loose", "missing loose object");
      const missing = (await git(remote, ["rev-parse", "HEAD:loose"])).trim();
      await git(workspace.directory, ["fetch", remote, "HEAD"]);
      await git(workspace.directory, ["merge", "--ff-only", "FETCH_HEAD"]);
      await rm(
        join(remote, ".git", "objects", missing.slice(0, 2), missing.slice(2)),
      );
    } else {
      await git(remote, ["checkout", "--orphan", "unrelated"]);
      await git(remote, ["rm", "-rf", "."]);
      await commit(remote, "unrelated", "other root");
    }
    await commit(workspace.directory, "next", "next host commit");
    const uploads: Buffer[] = [];
    const sync = await seedRemote(workspace, {
      ...lease,
      upload: async (...args) => {
        if (args[0].endsWith(".bundle")) uploads.push(await readFile(args[0]));
        await lease.upload(...args);
      },
    });
    await sync.close();
    assert.equal(prerequisites(uploads[0]!).length, 0);
    assert.equal(
      await git(remote, ["rev-parse", "HEAD"]),
      await git(workspace.directory, ["rev-parse", "HEAD"]),
    );
  }
});

test("rewritten remote history uses complete bundles and rejects host mutation", async (t) => {
  const { workspace, remote, lease } = await fixture(t);
  let bundle: Buffer | undefined;
  const sync = await seedRemote(workspace, {
    ...lease,
    download: async (...args) => {
      await lease.download(...args);
      if (args[1].endsWith("commits.bundle")) bundle = await readFile(args[1]);
    },
  });
  t.after(() => sync.close());
  const before = await metadata(workspace.directory);
  await git(remote, ["checkout", "--orphan", "rewritten"]);
  await git(remote, ["rm", "-rf", "."]);
  await commit(remote, "new-root", "rewritten");
  await assert.rejects(sync.pull());
  assert.ok(bundle);
  assert.equal(prerequisites(bundle).length, 0);
  assert.deepEqual(await metadata(workspace.directory), before);
});

test("invalid delta prerequisites and rejected patches leave host metadata unchanged", async (t) => {
  for (const failure of ["prerequisite", "patch"]) {
    const { workspace, remote, lease } = await fixture(t);
    const sync = await seedRemote(workspace, {
      ...lease,
      download: async (...args) => {
        await lease.download(...args);
        if (
          failure === "prerequisite" &&
          args[1].endsWith("commits-delta.bundle")
        ) {
          const data = await readFile(args[1]);
          const start = data.indexOf("\n-") + 2;
          data.fill("f", start, start + 40);
          await writeFile(args[1], data);
        }
        if (failure === "patch" && args[1].endsWith("remote.patch"))
          await writeFile(args[1], "invalid patch\n");
      },
    });
    t.after(() => sync.close());
    const before = await metadata(workspace.directory);
    await commit(remote, "feature", "remote committed");
    await assert.rejects(sync.pull());
    assert.deepEqual(await metadata(workspace.directory), before);
  }
});

test("failed delta application retains a self-contained bundle restorable without source history", async (t) => {
  const { workspace, remote, lease } = await fixture(t);
  const lock = (
    await git(workspace.directory, [
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "index.lock",
    ])
  ).trim();
  t.after(() => rm(lock, { force: true }));
  const sync = await seedRemote(workspace, {
    ...lease,
    download: async (...args) => {
      await lease.download(...args);
      if (args[1].endsWith("commits-delta.bundle"))
        await writeFile(lock, "injected lock");
    },
  });
  t.after(() => sync.close());
  const head = await commit(remote, "recover", "recoverable commit");
  let transfer = "";
  await assert.rejects(sync.pull(), (error) => {
    assert.ok(error instanceof OutpostError);
    transfer = String(error.details.recovery);
    return true;
  });
  const bundle = await readFile(join(transfer, "commits.bundle"));
  assert.equal(prerequisites(bundle).length, 0);
  const emptySource = await repository(t);
  await git(emptySource, ["checkout", "--orphan", "independent"]);
  await commit(emptySource, "unrelated", "different source");
  await git(emptySource, ["branch", "-D", "main"]);
  await git(emptySource, ["reflog", "expire", "--expire=now", "--all"]);
  await git(emptySource, ["gc", "--prune=now"]);
  const destinationParent = await mkdtemp(
    join(tmpdir(), "outpost-history-restored-"),
  );
  t.after(() => rm(destinationParent, { recursive: true, force: true }));
  const result = await restoreRecoveryTransfer(
    await planRecoveryRestore({
      directory: transfer,
      repository: emptySource,
      destination: join(destinationParent, "restored"),
      side: "incoming",
    }),
  );
  assert.equal(result.commit, head);
  assert.equal(
    await readFile(join(result.directory, "recover"), "utf8"),
    "recoverable commit",
  );
});
