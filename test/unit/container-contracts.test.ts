import { test } from "node:test";
import assert from "node:assert/strict";
import { containerProvider } from "../../src/providers/container.ts";
import type { Command } from "../../src/index.ts";
import { repository } from "../helpers.ts";

test("file mounts resolve the agent home and prepare writable parents without broad capabilities", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const provider = containerProvider(
    "docker",
    {
      label: false,
      user: { uid: 1234, gid: 5678 },
      volumes: [
        { source: "base.txt", target: "~/.config/tool/input", readOnly: true },
      ],
    },
    async (command) => {
      calls.push(command);
      return { status: 0, stdout: "1000:1000", stderr: "" };
    },
  );
  const lease = await provider.acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  const create = calls.find(
    (call) => call.arguments?.[0] === "create",
  )!.arguments!;
  assert.ok(
    create.some((value) =>
      value.includes("target=/home/agent/.config/tool/input,readonly"),
    ),
  );
  assert.ok(create.includes("CHOWN"));
  assert.ok(!create.includes("--privileged"));
  assert.ok(
    calls.some((call) =>
      call.arguments?.some((value) =>
        value.includes("chown 1234:5678 '/home/agent/.config/tool'"),
      ),
    ),
  );
  assert.ok(
    calls.some((call) =>
      call.arguments?.some((value) =>
        value.includes("chown 1234:5678 '/home/agent/.config'"),
      ),
    ),
  );
  await lease.release();
  await assert.rejects(
    containerProvider(
      "docker",
      { volumes: [{ source: "base.txt", target: "/etc/test" }] },
      async () => ({ status: 0, stdout: "", stderr: "" }),
    ).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    }),
    /agent home/,
  );
});

test("Podman supports explicit UID mapping and a namespace opt-out", async (t) => {
  const root = await repository(t);
  for (const userns of ["keep-id", false] as const) {
    const calls: Command[] = [];
    const lease = await containerProvider(
      "podman",
      {
        user: { uid: 3210, gid: 3211 },
        userns,
        groups: [42, "render"],
        devices: ["/dev/null"],
        networks: ["a", "b"],
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
    ).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    const args = calls.find(
      (call) => call.arguments?.[0] === "create",
    )!.arguments!;
    assert.equal(args.includes("--userns"), userns !== false);
    if (userns) assert.ok(args.includes("keep-id:uid=3210,gid=3211"));
    for (const flag of ["--group-add", "--device", "--network"])
      assert.ok(args.includes(flag));
    for (const value of ["42", "render", "/dev/null", "a", "b"])
      assert.ok(args.includes(value));
    await lease.release();
  }
});

test("Podman on macOS rejects an absent or stopped machine before image setup", async (t) => {
  const root = await repository(t);
  for (const machines of [[], [{ Running: false }]]) {
    const calls: Command[] = [];
    await assert.rejects(
      containerProvider(
        "podman",
        {},
        async (command) => {
          calls.push(command);
          return { status: 0, stdout: JSON.stringify(machines), stderr: "" };
        },
        "darwin",
      ).acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      }),
      /machine start/,
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.arguments?.[0], "machine");
  }
  const lease = await containerProvider(
    "podman",
    {},
    async (command) => ({
      status: 0,
      stdout: command.arguments?.[0] === "machine" ? '[{"Running":true}]' : "",
      stderr: "",
    }),
    "darwin",
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  await lease.release();
});

test("SELinux mount labels preserve readonly and writable combinations", async (t) => {
  const root = await repository(t);
  for (const label of ["z", "Z", false] as const)
    for (const readOnly of [true, false]) {
      const calls: Command[] = [];
      const lease = await containerProvider(
        "docker",
        { label, volumes: [{ source: root, target: "/inputs", readOnly }] },
        async (command) => {
          calls.push(command);
          return {
            status: 0,
            stdout:
              command.arguments?.[0] === "machine" ? '[{"Running":true}]' : "",
            stderr: "",
          };
        },
        "linux",
      ).acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      });
      const args = calls.find(
        (call) => call.arguments?.[0] === "create",
      )!.arguments!;
      if (label)
        assert.ok(
          args.some((value) =>
            value.endsWith(`/inputs:${readOnly ? "ro," : ""}${label}`),
          ),
        );
      else
        assert.ok(
          args.some((value) =>
            value.includes(`target=/inputs${readOnly ? ",readonly" : ""}`),
          ),
        );
      await lease.release();
    }
});
