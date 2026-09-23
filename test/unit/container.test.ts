import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { containerProvider, imageName } from "../../src/providers/container.ts";
import { docker } from "../../src/providers/docker.ts";
import { podman } from "../../src/providers/podman.ts";
import {
  mountedProvider,
  remoteProvider,
} from "../../src/providers/factories.ts";
import type { Command } from "../../src/domain/ports.ts";
import { repository } from "../helpers.ts";

test("container contract maps Git metadata, mounts, limits, credentials and invocation separately", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const provider = containerProvider(
    "docker",
    {
      image: "test:1",
      user: { uid: 1000, gid: 1000 },
      volumes: [
        { source: "base.txt", target: "~/inputs/base.txt", readOnly: true },
      ],
      networks: ["net-a", "net-b"],
      groups: [20],
      devices: ["/dev/null"],
      cpus: 2,
      memoryMb: 512,
      label: false,
    },
    async (command) => {
      calls.push(command);
      return {
        status: 0,
        stdout: command.arguments?.[0] === "image" ? "1000:1000\n" : "ok",
        stderr: "",
      };
    },
  );
  const lease = await provider.acquire({
    repository: root,
    directory: root,
    gitDirectories: [join(root, ".git")],
    variables: { PRIVATE_KEY: "hidden" },
  });
  const create = calls.find((call) => call.arguments?.[0] === "create")!;
  assert.equal(create.variables, undefined);
  assert.ok(!create.arguments?.includes("hidden"));
  assert.ok(create.arguments?.includes("--cpus"));
  assert.ok(create.arguments?.includes("net-b"));
  await lease.invoke({
    executable: "node",
    arguments: ["-e", "console.log(1)"],
    directory: "/workspace/sub",
    variables: { EXTRA: "value" },
  });
  const invocation = calls.find((call) => call.arguments?.includes("setsid"))!;
  assert.ok(invocation.arguments?.includes("--wait"));
  assert.equal(invocation.directory, undefined);
  assert.ok(invocation.arguments?.includes("/workspace/sub"));
  assert.ok(Object.values(invocation.variables ?? {}).includes("value"));
  assert.ok(Object.values(invocation.variables ?? {}).includes("hidden"));
  assert.equal(invocation.variables?.HOME, undefined);
  assert.ok(
    invocation.arguments?.some((value) =>
      value.includes("export GIT_WORK_TREE="),
    ),
  );
  await lease.release();
  await lease.release();
  assert.equal(calls.filter((call) => call.arguments?.[0] === "rm").length, 1);
  await assert.rejects(lease.invoke({ executable: "node" }), /closed/);
});

test("command cancellation kills only its process group and keeps the container", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  let fail = true;
  const lease = await containerProvider(
    "podman",
    { user: { uid: 1000, gid: 1000 } },
    async (command) => {
      calls.push(command);
      if (fail && command.arguments?.includes("setsid")) {
        fail = false;
        throw new Error("cancelled");
      }
      return {
        status: 0,
        stdout:
          command.arguments?.[0] === "machine" ? '[{"Running":true}]' : "",
        stderr: "",
      };
    },
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  await assert.rejects(
    lease.invoke({ executable: "sleep", arguments: ["100"] }),
    /cancelled/,
  );
  assert.ok(
    calls.some((call) =>
      call.arguments?.some((arg) => arg.includes("kill -TERM")),
    ),
  );
  assert.equal(calls.filter((call) => call.arguments?.[0] === "rm").length, 0);
  assert.equal(
    (await lease.invoke({ executable: "true", interactive: true })).status,
    0,
  );
  await lease.release();
});

test("container preflight validates UID, options and missing volumes", async (t) => {
  const root = await repository(t),
    context = {
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    };
  assert.throws(() => docker({ cpus: 0 }), /cpus/);
  assert.throws(() => podman({ memoryMb: 1 }), /memory/);
  await assert.rejects(
    containerProvider("docker", {}, async () => ({
      status: 0,
      stdout: "123",
      stderr: "",
    })).acquire(context),
    /UID/,
  );
  await assert.rejects(
    containerProvider(
      "docker",
      { volumes: [{ source: "absent", target: "/tmp/missing" }] },
      async () => ({ status: 0, stdout: "", stderr: "" }),
    ).acquire(context),
    /unavailable/,
  );
  let removed = false;
  await assert.rejects(
    containerProvider("docker", {}, async (command) => {
      if (command.arguments?.[0] === "start")
        return { status: 1, stdout: "", stderr: "failed" };
      if (command.arguments?.[0] === "rm") removed = true;
      return { status: 0, stdout: "", stderr: "" };
    }).acquire(context),
  );
  assert.equal(removed, true);
  assert.match(imageName(root), /^outpost:/);
});

test("custom providers retain their explicit placement", () => {
  const acquire = async () => {
    throw new Error("unused");
  };
  assert.equal(
    mountedProvider({ name: "custom", acquire }).placement,
    "mounted",
  );
  assert.equal(remoteProvider({ name: "custom", acquire }).placement, "remote");
  assert.throws(() => remoteProvider({ name: "", acquire }));
});
