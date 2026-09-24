import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { containerProvider } from "../../src/providers/container.ts";
import { containerMounts } from "../../src/providers/container-mounts.ts";
import type { Command } from "../../src/index.ts";
import { repository } from "../helpers.ts";

test("isolated containers use remote placement and private writable Git storage", async (t) => {
  const root = await repository(t);
  for (const engine of ["docker", "podman"] as const) {
    const calls: Command[] = [];
    const provider = containerProvider(
      engine,
      {
        repositoryMode: "isolated",
        user: { uid: 1234, gid: 1234 },
      },
      async (command) => {
        calls.push(command);
        return {
          status: 0,
          stdout:
            command.arguments?.[0] === "machine" ? '[{"Running":true}]' : "",
          stderr: "",
        };
      },
    );
    assert.equal(provider.placement, "remote");
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [join(root, ".git")],
      variables: {},
    });
    assert.equal(lease.root, "/outpost/workspace");
    const create = calls.find(
      (call) => call.arguments?.[0] === "create",
    )!.arguments!;
    assert.equal(create[create.indexOf("--workdir") + 1], "/");
    assert.ok(!create.includes("--mount") && !create.includes("--volume"));
    assert.ok(!create.some((arg) => arg.includes(root)));
    assert.ok(
      calls.some((call) =>
        call.arguments?.some((arg) =>
          arg.includes("chown 1234:1234 '/outpost/workspace' /outpost"),
        ),
      ),
    );
    await lease.invoke({ executable: "git", arguments: ["status"] });
    assert.ok(
      !calls.some((call) =>
        call.arguments?.some((arg) => arg.includes("export GIT_DIR=")),
      ),
    );
    await lease.release();
  }
  assert.equal(containerProvider("docker").placement, "mounted");
});

test("isolated mounts reject canonical repository aliases and reserved targets", async (t) => {
  const root = await repository(t);
  const outside = await mkdtemp(join(tmpdir(), "outpost-mount-"));
  t.after(() => rm(outside, { recursive: true, force: true }));
  const workspace = await repository(t);
  const gitStorage = await repository(t);
  const alias = join(outside, "alias");
  await symlink(root, alias, "junction");
  const context = {
    repository: root,
    directory: workspace,
    gitDirectories: [gitStorage],
    variables: {},
  };
  const mounts = (source: string, target: string) =>
    containerMounts(
      context,
      {
        repositoryMode: "isolated",
        volumes: [{ source, target, readOnly: true }],
      },
      process.platform,
      "/outpost/workspace",
      "/home/agent",
    );
  for (const source of [
    root,
    workspace,
    gitStorage,
    dirname(root),
    join(root, ".git"),
    join(root, "base.txt"),
    alias,
  ])
    await assert.rejects(mounts(source, "/inputs"), /must not expose/);
  for (const target of [
    "/",
    "/outpost",
    "/outpost/git",
    "relative",
    "/tmp",
    "/tmp/probe",
    "../../tmp/probe",
  ])
    await assert.rejects(mounts(outside, target), /must not overlap/);
  const allowed = await mounts(outside, "/inputs");
  assert.equal(allowed.volumes.length, 2);
  assert.equal(allowed.env.GIT_DIR, undefined);
  const home = await mounts(outside, "~/inputs");
  assert.match(home.volumes[1]!, /\/home\/agent\/inputs/);
});
