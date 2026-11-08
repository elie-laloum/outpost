import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { containerProvider } from "../../src/providers/container.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import { createWorkspace } from "../../src/workspaces.ts";
import type { Command } from "../../src/core.ts";
import type {
  ContainerImageMount,
  ContainerOptions,
} from "../../src/providers/docker.ts";
import { repository } from "../helpers.ts";

type Engine = "docker" | "podman";
type Mode = "mounted" | "isolated";

const engines: readonly Engine[] = ["docker", "podman"];
const user = { uid: 1000, gid: 1000 };

function recorder() {
  const calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return {
      status: 0,
      stdout: command.arguments?.[0] === "machine" ? '[{"Running":true}]' : "",
      stderr: "",
    };
  };
  const created = () =>
    calls.find((call) => call.arguments?.[0] === "create")?.arguments ?? [];
  return { calls, executor, created };
}

async function acquire(
  t: { after(cleanup: () => Promise<unknown>): void },
  engine: Engine,
  options: ContainerOptions,
) {
  const root = await repository(t);
  const recorded = recorder();
  const lease = await containerProvider(
    engine,
    { image: "sandbox:1", user, label: false, ...options },
    recorded.executor,
    "linux",
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  await lease.release();
  return { root, ...recorded };
}

const imageMountValues = (args: readonly string[]) =>
  args.filter(
    (value, index) =>
      args[index - 1] === "--mount" && value.startsWith("type=image,"),
  );

test("image mounts emit each engine's read-only syntax with and without a subpath", async (t) => {
  const imageMounts: ContainerImageMount[] = [
    {
      image: "registry.example/tools:1",
      path: "/usr/local/bin",
      target: "/opt/platform/bin",
    },
    { image: "registry.example/tools:1", target: "~/platform" },
    { image: "data@sha256:0123", path: "/", target: "/srv/fixtures" },
  ];
  const expected: Record<Engine, string[]> = {
    docker: [
      "type=image,source=registry.example/tools:1,target=/opt/platform/bin,readonly,image-subpath=usr/local/bin",
      "type=image,source=registry.example/tools:1,target=/home/agent/platform,readonly",
      "type=image,source=data@sha256:0123,target=/srv/fixtures,readonly",
    ],
    podman: [
      "type=image,source=registry.example/tools:1,destination=/opt/platform/bin,rw=false,subpath=/usr/local/bin",
      "type=image,source=registry.example/tools:1,destination=/home/agent/platform,rw=false",
      "type=image,source=data@sha256:0123,destination=/srv/fixtures,rw=false",
    ],
  };
  for (const engine of engines) {
    const { created } = await acquire(t, engine, {
      imageMounts,
      label: false,
    });
    assert.deepEqual(imageMountValues(created()), expected[engine]);
  }
});

test(
  "image mounts use --mount beside labelled bind volumes and caches",
  { skip: process.platform === "win32" },
  async (t) => {
    for (const engine of engines) {
      const { root, created } = await acquire(t, engine, {
        label: "Z",
        volumes: [{ source: ".", target: "/inputs", readOnly: true }],
        caches: [{ name: "npm", key: "v1" }],
        imageMounts: [{ image: "tools:1", path: "/opt", target: "/opt/tools" }],
      });
      const args = created();
      const bind = args.indexOf(`${root}:/inputs:ro,Z`);
      const image = args.findIndex((value) =>
        value.startsWith("type=image,source=tools:1,"),
      );
      const cache = args.findIndex((value) =>
        value.endsWith(":/outpost/cache/npm:nocopy"),
      );
      assert.ok(args.includes(`${root}:/workspace:Z`));
      assert.ok(bind > 0 && image > bind && cache > image, args.join(" "));
      assert.equal(args[image - 1], "--mount");
      assert.equal(args[bind - 1], "--volume");
    }
  },
);

test("image mounts need no matching path on the caller's disk", async (t) => {
  const missing = "/outpost-image-mount-test/definitely/missing";
  await assert.rejects(stat(missing), /ENOENT/);
  const imageMounts = [
    { image: "absent-on-host:1", path: missing, target: missing },
  ];
  for (const repositoryMode of ["mounted", "isolated"] as const) {
    const { created } = await acquire(t, "podman", {
      repositoryMode,
      imageMounts,
    });
    assert.deepEqual(imageMountValues(created()), [
      `type=image,source=absent-on-host:1,destination=${missing},rw=false,subpath=${missing}`,
    ]);
  }
});

const rejectsAt =
  (path: (string | number)[], message?: RegExp) => (error: unknown) =>
    error instanceof ConfigurationError &&
    error.diagnostic.code === "invalid-container-image-mount" &&
    error.diagnostic.path.join(".") === path.join(".") &&
    (message === undefined || message.test(error.diagnostic.message));

test("image mounts reject invalid fields, unknown keys and CSV characters at provider creation", () => {
  const mount = (fields: object) => [
    { image: "tools:1", target: "/opt/tools", ...fields },
  ];
  const invalid: [unknown, (string | number)[]][] = [
    [{}, ["imageMounts"]],
    ["tools:1", ["imageMounts"]],
    [[null], ["imageMounts", 0]],
    [[["tools:1", "/opt"]], ["imageMounts", 0]],
    [mount({ subpath: "/usr/bin" }), ["imageMounts", 0, "subpath"]],
    [mount({ readOnly: false }), ["imageMounts", 0, "readOnly"]],
    ...[
      "",
      "-tools:1",
      "tools 1",
      "tools\t1",
      "tools,1",
      'tools"1',
      "tools\n1",
      42,
    ].map((image): [unknown, (string | number)[]] => [
      mount({ image }),
      ["imageMounts", 0, "image"],
    ]),
    [[{ target: "/opt/tools" }], ["imageMounts", 0, "image"]],
    ...[
      "",
      "usr/local/bin",
      "/usr/../etc",
      "/..",
      "/usr/./bin",
      "/usr//bin",
      "/usr/bin/",
      "/a,b",
      '/a"b',
      "/a\nb",
      7,
    ].map((path): [unknown, (string | number)[]] => [
      mount({ path }),
      ["imageMounts", 0, "path"],
    ]),
    ...["", "/a,b", '/opt/"tools"', "/a\u0000b", 5].map(
      (target): [unknown, (string | number)[]] => [
        mount({ target }),
        ["imageMounts", 0, "target"],
      ],
    ),
    [[{ image: "tools:1" }], ["imageMounts", 0, "target"]],
    [
      [
        { image: "tools:1", target: "/a" },
        { image: "-x", target: "/b" },
      ],
      ["imageMounts", 1, "image"],
    ],
  ];
  for (const [imageMounts, path] of invalid)
    assert.throws(
      () =>
        containerProvider("docker", {
          imageMounts: imageMounts as readonly ContainerImageMount[],
        }),
      rejectsAt(path),
      JSON.stringify(imageMounts),
    );
  assert.throws(
    () => containerProvider("podman", { imageMounts: mount({ path: "usr" }) }),
    (error) =>
      error instanceof ConfigurationError &&
      error.diagnostic.hint?.includes("/usr/local/bin") === true,
  );
  assert.throws(
    () =>
      containerProvider("podman", {
        imageMounts: mount({ readOnly: false }),
      }),
    (error) =>
      error instanceof ConfigurationError &&
      error.diagnostic.hint?.includes("always read-only") === true,
  );
  for (const valid of [
    {},
    { path: "/" },
    { path: "/usr/local/bin" },
    { path: "/.config/tool" },
    { image: "registry.example:5000/tools@sha256:0123" },
  ])
    assert.doesNotThrow(() =>
      containerProvider("docker", { imageMounts: mount(valid) }),
    );
});

test("image mounts are copied when the provider is created", async (t) => {
  const root = await repository(t);
  const recorded = recorder();
  const imageMounts = [{ image: "tools:1", path: "/opt", target: "/opt/a" }];
  const provider = containerProvider(
    "docker",
    { image: "sandbox:1", user, label: false, imageMounts },
    recorded.executor,
    "linux",
  );
  imageMounts[0]!.target = "/changed";
  imageMounts.push({ image: "other:1", path: "/", target: "/other" });
  const lease = await provider.acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  await lease.release();
  assert.deepEqual(imageMountValues(recorded.created()), [
    "type=image,source=tools:1,target=/opt/a,readonly,image-subpath=opt",
  ]);
});

test("image mount targets cannot hide Outpost's paths or sit inside the workspace root, checked at provider creation", () => {
  const hidden = /would hide/;
  const reserved = /overlaps \/outpost/;
  const inside = /inside the workspace root/;
  const isolated = /Isolated image mount target/;
  const cases: [Mode, string, RegExp][] = [
    ...(["mounted", "isolated"] as const).flatMap(
      (mode): [Mode, string, RegExp][] => [
        [mode, "/", hidden],
        [mode, "/tmp", hidden],
        [mode, "/home", hidden],
        [mode, "/home/agent", hidden],
        [mode, "~", hidden],
        [mode, "/outpost", reserved],
        [mode, "/outpost/git", reserved],
        [mode, "/outpost/git/common", reserved],
        [mode, "/outpost/git/worktree", reserved],
        [mode, "/outpost/cache", reserved],
        [mode, "/outpost/cache/npm", reserved],
        [mode, "/outpost/tools", reserved],
      ],
    ),
    ["mounted", "/workspace", hidden],
    ["mounted", ".", hidden],
    ["mounted", "..", hidden],
    ["mounted", "tools", inside],
    ["mounted", "/workspace/tools", inside],
    ["isolated", "/tmp/outpost", hidden],
    ["isolated", ".", hidden],
    ["isolated", "relative", inside],
    ["isolated", "/tmp/outpost/workspace/tools", inside],
    ["isolated", "/tmp/tools", isolated],
    ["isolated", "../../tmp/tools", isolated],
  ];
  for (const [repositoryMode, target, message] of cases)
    assert.throws(
      () =>
        containerProvider("docker", {
          repositoryMode,
          caches: [{ name: "npm", key: "v1" }],
          imageMounts: [{ image: "tools:1", target }],
        }),
      (error) =>
        rejectsAt(["imageMounts", 0, "target"], message)(error) &&
        error instanceof ConfigurationError &&
        error.diagnostic.hint?.includes("/opt/tools") === true,
      `${repositoryMode} ${target}`,
    );
  const allowed: [Mode, string][] = [
    ["mounted", "/opt/tools"],
    ["mounted", "~/tools"],
    ["mounted", "/tmp/tools"],
    ["mounted", "~/../../srv/tools"],
    ["isolated", "/opt/tools"],
    ["isolated", "~/tools"],
    ["isolated", "/workspace"],
  ];
  for (const [repositoryMode, target] of allowed)
    assert.doesNotThrow(
      () =>
        containerProvider("docker", {
          repositoryMode,
          imageMounts: [{ image: "tools:1", target }],
        }),
      `${repositoryMode} ${target}`,
    );
});

test("nested image mount targets produce one argument each; the engine needs the mountpoint in the image", async (t) => {
  const { created } = await acquire(t, "docker", {
    label: false,
    volumes: [{ source: ".", target: "/opt/tools/config", readOnly: true }],
    imageMounts: [
      { image: "tools:1", target: "/opt/tools" },
      { image: "tools:1", path: "/usr/bin", target: "/opt/tools/bin" },
    ],
  });
  assert.deepEqual(imageMountValues(created()), [
    "type=image,source=tools:1,target=/opt/tools,readonly",
    "type=image,source=tools:1,target=/opt/tools/bin,readonly,image-subpath=usr/bin",
  ]);
  assert.ok(
    created().some((value) => value.includes("target=/opt/tools/config")),
  );
});

test("file workspaces pass image mounts to the sandbox they allocate", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-image-mounts-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await using workspace = await createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: join(directory, "runtime") },
  });
  const recorded = recorder();
  const provider = containerProvider(
    "podman",
    {
      image: "sandbox:1",
      user,
      label: false,
      imageMounts: [
        { image: "tools:1", path: "/usr/local/bin", target: "/opt/tools" },
      ],
    },
    recorded.executor,
    "linux",
  );
  const lease = await provider.workspaces!.acquire({
    workspace: await workspace.checkpoint(),
    runtime: workspace.runtime,
    variables: {},
  });
  await lease.release();
  assert.deepEqual(imageMountValues(recorded.created()), [
    "type=image,source=tools:1,destination=/opt/tools,rw=false,subpath=/usr/local/bin",
  ]);
});
