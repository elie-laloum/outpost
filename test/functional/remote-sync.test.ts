import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openWorkspace } from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

test("remote synchronization preserves commit identity and handles repeated dirty-to-committed transitions", async (t) => {
  const root = await repository(t),
    workspace = await openWorkspace({
      repository: root,
      branch: { mode: "named", name: "remote-work" },
    });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const lease = await localSandboxProvider().acquire({
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
  const lease = await localSandboxProvider().acquire({
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
