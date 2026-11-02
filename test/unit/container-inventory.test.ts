import { test } from "node:test";
import assert from "node:assert/strict";
import { containerProvider } from "../../src/providers/container.ts";
import { listContainerSandboxes } from "../../src/providers/container-inventory.ts";
import { recoverContainer } from "../../src/providers/container-recovery.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import {
  listDockerSandboxes,
  removeDockerSandbox,
} from "../../src/providers/docker.ts";
import {
  listPodmanSandboxes,
  removePodmanSandbox,
} from "../../src/providers/podman.ts";
import type { Command, CommandResult } from "../../src/domain/command.types.ts";
import { linuxHostMounts, repository } from "../helpers.ts";

const sandbox = "outpost-12345678-1234-1234-1234-123456789abc";
const other = "outpost-87654321-4321-4321-4321-cba987654321";
const ok = (stdout = ""): CommandResult => ({ status: 0, stdout, stderr: "" });
const line = (name: string, labels: unknown) =>
  `${JSON.stringify(name)} ${JSON.stringify(labels)}`;

test("caller labels are set by the create commands of the sandbox and its egress companion", async (t) => {
  const root = await repository(t);
  for (const engine of ["docker", "podman"] as const) {
    const calls: Command[] = [];
    let id = "";
    const labels: Record<string, string> = {
      "com.example/job": "42",
      "com.example.team": "a=b, c",
    };
    const provider = containerProvider(
      engine,
      {
        image: "agent",
        egressImage: "proxy",
        egress: { mode: "allowlist", domains: ["example.com"] },
        repositoryMode: "isolated",
        labels,
        ...linuxHostMounts,
      },
      async (command) => {
        calls.push(command);
        if (command.arguments?.[0] === "machine")
          return ok('[{"Running":true}]');
        return ok(command.arguments?.[0] === "container" ? `${id}-egress` : "");
      },
      "linux",
    );
    labels["com.example/job"] = "changed";
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
      registerRecovery: async (name) => {
        id = name;
      },
    });
    const creates = calls
      .filter((command) => command.arguments?.[0] === "create")
      .map((command) => command.arguments!);
    assert.equal(creates.length, 2);
    for (const create of creates) {
      const declared = create.flatMap((value, index) =>
        create[index - 1] === "--label" ? [value] : [],
      );
      assert.ok(declared.includes("com.example/job=42"));
      assert.ok(declared.includes("com.example.team=a=b, c"));
    }
    assert.ok(creates[0]!.includes(`io.outpost.egress.owner=${id}`));
    await lease.release();
  }
});

test("sandboxes without caller labels keep their create command unchanged", async (t) => {
  const root = await repository(t);
  const calls: Command[] = [];
  const lease = await containerProvider(
    "docker",
    { image: "agent", user: { uid: 1000, gid: 1000 } },
    async (command) => {
      calls.push(command);
      return ok(command.arguments?.[0] === "image" ? "1000:1000\n" : "");
    },
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  const create = calls.find((command) => command.arguments?.[0] === "create")!;
  assert.ok(!create.arguments!.includes("--label"));
  await lease.release();
});

test("caller labels reject unsafe keys, reserved keys and invalid values at provider creation", () => {
  const invalid: unknown[] = [
    { "": "value" },
    { " key": "value" },
    { "a key": "value" },
    { "key=value": "value" },
    { "-key": "value" },
    { "--privileged": "true" },
    { _proto: "value" },
    { ["k".repeat(256)]: "value" },
    { "io.outpost.egress.owner": "outpost-x" },
    { "IO.Outpost.sandbox": "true" },
    { key: "" },
    { key: "job-42 " },
    { key: " job-42" },
    { key: "\tjob" },
    { key: "line\nbreak" },
    { key: "v".repeat(1025) },
    { key: 1 },
    ["key=value"],
    new Map([["key", "value"]]),
    new (class Labels {
      key = "value";
    })(),
    null,
  ];
  for (const labels of invalid)
    assert.throws(
      () =>
        containerProvider("docker", {
          labels: labels as Record<string, string>,
        }),
      ConfigurationError,
      JSON.stringify(labels),
    );
  assert.throws(
    () => containerProvider("docker", { labels: { "com.example/job": "a " } }),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "invalid-container-label" &&
      error.diagnostic.path.join(".") === "labels.com.example/job",
  );
  assert.throws(
    () => containerProvider("docker", { labels: { "io.outpost.job": "1" } }),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "reserved-container-label" &&
      error.diagnostic.path.join(".") === "labels.io.outpost.job" &&
      error.diagnostic.hint?.includes("com.example.job") === true,
  );
  const prototypeFree: Record<string, string> = Object.create(null);
  prototypeFree["com.example/job"] = "-leading dash is a value";
  assert.doesNotThrow(() =>
    containerProvider("podman", { labels: prototypeFree }),
  );
});

test("listing filters by every label and reports sandboxes and orphaned companions", async () => {
  const calls: Command[] = [];
  const result = await listContainerSandboxes(
    "docker",
    {
      labels: { "com.example/app": "web", "com.example/job": "a,b" },
      deadlineMs: 5_000,
    },
    async (command) => {
      calls.push(command);
      if (command.arguments?.[1] === "ls")
        return ok(
          [
            `${other}-egress`,
            sandbox,
            `${sandbox}-egress`,
            "outpost-gui-postgres-1",
            "outpost-12345678-1234-1234-1234-123456789abc-egress-egress",
            "",
          ].join("\n"),
        );
      return ok(
        [
          line(`/${other}-egress`, {
            "com.example/app": "web",
            "io.outpost.egress.owner": other,
          }),
          line(`/${sandbox}`, {
            "com.example/app": "web",
            "IO.Outpost.image": "inherited",
          }),
          line(`/${sandbox}-egress`, {
            "io.outpost.egress.owner": sandbox,
          }),
        ].join("\n") + "\n",
      );
    },
  );
  assert.deepEqual(result, [
    { name: sandbox, labels: { "com.example/app": "web" } },
    { name: other, labels: { "com.example/app": "web" } },
  ]);
  const [list, inspect] = calls;
  assert.deepEqual(list!.arguments, [
    "container",
    "ls",
    "--all",
    "--filter",
    "name=^outpost-",
    "--filter",
    "label=com.example/app=web",
    "--filter",
    "label=com.example/job=a,b",
    "--format",
    "{{.Names}}",
  ]);
  assert.deepEqual(inspect!.arguments!.slice(4), [
    `${other}-egress`,
    sandbox,
    `${sandbox}-egress`,
  ]);
  assert.ok(calls.every((command) => command.deadlineMs === 5_000));
  assert.ok(calls.every((command) => command.signal === calls[0]!.signal));
  assert.equal(calls.length, 2);
});

test("listing ignores companions that do not name their sandbox as owner", async () => {
  const result = await listContainerSandboxes(
    "podman",
    { labels: { app: "web" } },
    async (command) =>
      command.arguments?.[1] === "ls"
        ? ok(`${sandbox}-egress`)
        : ok(line(`${sandbox}-egress`, { app: "web" })),
  );
  assert.deepEqual(result, []);
});

test("listing skips inspection when nothing matches and requires a label selector", async () => {
  const calls: Command[] = [];
  const result = await listContainerSandboxes(
    "podman",
    { labels: { app: "web" } },
    async (command) => {
      calls.push(command);
      return ok("outpost-gui-postgres-1\n");
    },
  );
  assert.deepEqual(result, []);
  assert.equal(calls.length, 1);
  await assert.rejects(
    listContainerSandboxes("podman", { labels: {} }, async () => ok()),
    /at least one label/,
  );
  await assert.rejects(
    listContainerSandboxes(
      "podman",
      { labels: { "io.outpost.egress.owner": sandbox } },
      async () => ok(),
    ),
    /reserved/,
  );
});

test("listing inspects the re-listed sandboxes after a removal between listing and inspection", async () => {
  const third = "outpost-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  let lists = 0;
  const inspected: string[][] = [];
  const result = await listContainerSandboxes(
    "docker",
    { labels: { app: "web" } },
    async (command) => {
      const args = command.arguments ?? [];
      if (args[1] === "ls")
        return ok(
          ++lists === 1 ? `${sandbox}\n${other}` : `${other}\n${third}`,
        );
      inspected.push(args.slice(4));
      if (args.includes(sandbox))
        return { status: 1, stdout: "", stderr: "No such object" };
      return ok(`${line(`/${other}`, null)}\n${line(`/${third}`, {})}`);
    },
  );
  assert.deepEqual(result, [
    { name: other, labels: {} },
    { name: third, labels: {} },
  ]);
  assert.deepEqual(inspected, [
    [sandbox, other],
    [other, third],
  ]);
});

test("one deadline bounds the whole listing, retries included", async () => {
  const started = Date.now();
  const calls: Command[] = [];
  await assert.rejects(
    listContainerSandboxes(
      "podman",
      { labels: { app: "web" }, deadlineMs: 50 },
      (command) => {
        calls.push(command);
        if (command.arguments?.[1] === "ls")
          return Promise.resolve(ok(sandbox));
        return new Promise((_resolve, reject) => {
          const signal = command.signal!;
          if (signal.aborted) reject(signal.reason);
          signal.addEventListener("abort", () => reject(signal.reason));
        });
      },
    ),
    { name: "OutpostError", code: "timeout" },
  );
  assert.ok(Date.now() - started < 5_000);
  assert.ok(calls.every((command) => command.signal?.aborted));
  const controller = new AbortController();
  controller.abort(new Error("stopped"));
  await assert.rejects(
    listContainerSandboxes(
      "podman",
      { labels: { app: "web" }, signal: controller.signal },
      async (command) => {
        command.signal?.throwIfAborted();
        return ok();
      },
    ),
    /stopped/,
  );
});

test("listing reports inspection failures that are not explained by removal", async () => {
  await assert.rejects(
    listContainerSandboxes("docker", { labels: { app: "web" } }, async (c) =>
      c.arguments?.[1] === "ls"
        ? ok(sandbox)
        : { status: 1, stdout: "", stderr: "daemon unavailable" },
    ),
    {
      code: "process",
      details: { status: 1, stdout: "", stderr: "daemon unavailable" },
    },
  );
  for (const output of [
    "not-json",
    `"${sandbox}"`,
    `"${sandbox}" [1]`,
    `"${sandbox}" {"app":1}`,
    `1 {"app":"web"}`,
  ]) {
    let calls = 0;
    await assert.rejects(
      listContainerSandboxes(
        "docker",
        { labels: { app: "web" } },
        async (command) => {
          calls++;
          return ok(command.arguments?.[1] === "ls" ? sandbox : output);
        },
      ),
      { name: "OutpostError", code: "provider" },
      output,
    );
    assert.equal(calls, 2, output);
  }
});

test("removal deletes the sandbox and its companion, is idempotent and refuses foreign containers", async () => {
  const existing = new Set([sandbox, `${sandbox}-egress`]);
  const calls: Command[] = [];
  const controller = new AbortController();
  const executor = async (command: Command) => {
    calls.push(command);
    const args = command.arguments ?? [];
    if (args[0] === "rm") existing.delete(args.at(-1)!);
    return ok(args[0] === "container" ? [...existing].join("\n") : "");
  };
  await recoverContainer("podman", executor, sandbox, {
    deadlineMs: 3_000,
    signal: controller.signal,
  });
  await recoverContainer("podman", executor, sandbox, {});
  assert.deepEqual(existing, new Set());
  assert.deepEqual(
    calls
      .filter((command) => command.arguments?.[0] === "rm")
      .map((command) => command.arguments),
    [
      ["rm", "--force", sandbox],
      ["rm", "--force", `${sandbox}-egress`],
    ],
  );
  assert.equal(calls[0]!.deadlineMs, 3_000);
  assert.equal(calls[0]!.signal, controller.signal);
  for (const name of ["outpost-gui-postgres-1", `${sandbox}-egress`, "-f"])
    await assert.rejects(
      recoverContainer("podman", executor, name, {}),
      /identity/,
    );
});

test("public Docker and Podman inventory functions validate before running the engine", async () => {
  for (const list of [listDockerSandboxes, listPodmanSandboxes])
    await assert.rejects(list({ labels: {} }), /at least one label/);
  for (const remove of [removeDockerSandbox, removePodmanSandbox])
    await assert.rejects(remove("outpost-gui-postgres-1"), /identity/);
});
