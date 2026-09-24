import { spawn } from "node:child_process";
import { once } from "node:events";
import { diagnoseImage } from "../src/application/doctor-image.ts";
import { agentVersions } from "../src/providers/versions.constants.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile, readlink, lstat } from "node:fs/promises";
import { join } from "node:path";
import { createSandbox, codex, claude } from "../src/index.ts";
import { docker } from "../src/providers/docker.ts";
import { podman } from "../src/providers/podman.ts";
import { repository } from "./helpers.ts";
import type { AgentEvent } from "../src/index.ts";
import { conversations } from "../src/index.ts";
import { executeProcess } from "../src/infrastructure/process.ts";
import { imageRecipe } from "../src/cli/scaffold.constants.ts";

test(
  "real container supports Git, native CLIs, transfers, cancellation and warm reuse",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t),
      provider =
        process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    const box = await createSandbox({
      repository: root,
      provider: provider({ image: "outpost-ci:latest", networks: "none" }),
      agent: codex(),
      branch: { mode: "named", name: "container-test" },
      logging: false,
    });
    try {
      const result = await box.command({
        executable: "sh",
        arguments: [
          "-c",
          "printf 'container change\\n' > base.txt; git add base.txt && git commit -m 'Container commit' && git status --porcelain",
        ],
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(
        await readFile(join(box.workspace.directory, "base.txt"), "utf8"),
        "container change\n",
      );
      for (const adapter of [codex(), claude()]) {
        const version = await box.command({
          executable: adapter.name,
          arguments: ["--version"],
        });
        assert.equal(version.status, 0, version.stderr);
        const help = await box.command({
          ...adapter.request({
            text: "",
            continuation: {
              id: "00000000-0000-0000-0000-000000000000",
              fork: true,
            },
          }),
          arguments: [
            ...adapter.request({
              continuation: {
                id: "00000000-0000-0000-0000-000000000000",
                fork: true,
              },
            }).arguments!,
            "--help",
          ],
        });
        assert.equal(help.status, 0, help.stderr);
      }
      const cancelled = box.command({
        executable: "sh",
        arguments: ["-c", "sleep 2; echo leaked > cancellation-leak.txt"],
        deadlineMs: 100,
      });
      await assert.rejects(cancelled);
      assert.equal((await box.command({ executable: "true" })).status, 0);
      const verify = await box.command({
        executable: "sh",
        arguments: [
          "-c",
          "sleep 3; test ! -e cancellation-leak.txt && test ! -S /var/run/docker.sock",
        ],
      });
      assert.equal(verify.status, 0);
      const env = await box.command({
        executable: "printenv",
        arguments: ["OUTPOST_FIXTURE"],
        variables: { OUTPOST_FIXTURE: "injected" },
      });
      assert.equal(env.stdout.trim(), "injected");
      const output = await box.dispatch({
        agent: {
          name: "protocol-fixture",
          request: () => ({
            executable: "node",
            arguments: [
              "-e",
              "console.log(JSON.stringify({kind:'text',text:'<outpost>done</outpost>'}))",
            ],
          }),
          events: (line) => [JSON.parse(line) as AgentEvent],
        },
        brief: { text: "Verify dispatch in a real container" },
      });
      assert.equal(output.completed, true);
    } finally {
      await box.close();
    }
  },
);

test(
  "real container round-trips binary trees and prepares writable file-mount parents",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t),
      factory =
        process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    const input = join(root, "transfer inputs");
    await mkdir(join(input, "nested folder"), { recursive: true });
    const bytes = Buffer.from([0, 1, 2, 255, 128, 10, 13, 0]);
    await writeFile(join(input, "nested folder", "binary file.bin"), bytes);
    const mounted = join(root, "mounted.txt");
    await writeFile(mounted, "read-only source");
    const lease = await factory({
      image: "outpost-ci:latest",
      networks: "none",
      volumes: [
        {
          source: mounted,
          target: "~/private/deep/config.txt",
          readOnly: true,
        },
      ],
    }).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    try {
      await lease.upload(input, "/home/agent/transfer inputs");
      const visible = await lease.invoke({
        executable: "node",
        arguments: [
          "-e",
          "const f=require('node:fs');const p='/home/agent/transfer inputs/nested folder/binary file.bin';process.stdout.write(f.readFileSync(p).toString('hex'));f.appendFileSync(p,Buffer.from([42]));",
        ],
      });
      assert.equal(visible.status, 0, visible.stderr);
      assert.equal(visible.stdout, bytes.toString("hex"));
      const destination = join(root, "downloaded tree");
      await lease.download("/home/agent/transfer inputs", destination);
      assert.deepEqual(
        await readFile(join(destination, "nested folder", "binary file.bin")),
        Buffer.concat([bytes, Buffer.from([42])]),
      );
      await lease.upload(
        join(input, "nested folder", "binary file.bin"),
        "/home/agent/single.bin",
      );
      await lease.download(
        "/home/agent/single.bin",
        join(root, "single copy.bin"),
      );
      assert.deepEqual(await readFile(join(root, "single copy.bin")), bytes);
      const permissions = await lease.invoke({
        executable: "sh",
        arguments: [
          "-c",
          'test "$(id -u)" != 0 && test "$(cat /home/agent/private/deep/config.txt)" = \'read-only source\' && echo sibling > /home/agent/private/deep/sibling.txt && ! echo forbidden > /home/agent/private/deep/config.txt',
        ],
      });
      assert.equal(permissions.status, 0, permissions.stderr);
    } finally {
      await lease.release();
    }
  },
);

test(
  "container commands wait, propagate failures and cancel descendants without closing the sandbox",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    const lease = await factory({
      image: "outpost-ci:latest",
      networks: "none",
    }).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    try {
      const delayed = await lease.invoke({
        executable: "sh",
        arguments: ["-c", "sleep 1; echo done; exit 7"],
      });
      assert.equal(delayed.stdout, "done\n");
      assert.equal(delayed.status, 7);
      const closed = await lease.invoke({
        executable: "sh",
        arguments: [
          "-c",
          "exec >/dev/null 2>&1; sleep 1; echo done > /tmp/closed-streams; exit 7",
        ],
      });
      assert.equal(closed.status, 7);
      assert.equal(
        (
          await lease.invoke({
            executable: "cat",
            arguments: ["/tmp/closed-streams"],
          })
        ).stdout,
        "done\n",
      );
      for (const interactive of [false, true]) {
        const result = await lease.invoke({
          executable: "sh",
          arguments: ["-c", "printf input:; read value; echo $value; exit 9"],
          interactive,
          stdin: "hello\n",
          terminal: {},
        });
        assert.equal(result.status, 9);
        assert.match(result.stdout, /input:hello/);
      }
      const stop = new AbortController();
      const timer = setTimeout(
        () => stop.abort(new Error("cancel fixture")),
        500,
      );
      try {
        await assert.rejects(
          lease.invoke({
            executable: "sh",
            arguments: [
              "-c",
              "(sleep 2; echo leaked > /tmp/descendant) & wait",
            ],
            signal: stop.signal,
          }),
          /cancel fixture/,
        );
      } finally {
        clearTimeout(timer);
      }
      assert.equal(
        (
          await lease.invoke({
            executable: "sh",
            arguments: ["-c", "sleep 2; test ! -e /tmp/descendant"],
          })
        ).status,
        0,
      );
      const missing = await lease.invoke({
        executable: "outpost-command-that-does-not-exist",
      });
      assert.notEqual(missing.status, 0);
    } finally {
      await lease.release();
    }
  },
);

test(
  "native home files, permissions, links and conversation capture survive binary transfers",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    const lease = await factory({
      image: "outpost-ci:latest",
      networks: "none",
    }).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    try {
      const created = await lease.invoke({
        executable: "sh",
        arguments: [
          "-c",
          "mkdir -p /home/agent/tree; head -c 2097152 /dev/urandom > /home/agent/tree/data; printf '#!/bin/sh\\necho hello\\n' > /home/agent/tree/run; chmod 750 /home/agent/tree/run; ln -s data /home/agent/tree/link",
        ],
      });
      assert.equal(created.status, 0, created.stderr);
      const destination = join(root, "tree copy");
      await lease.download("/home/agent/tree", destination);
      assert.equal((await readFile(join(destination, "data"))).length, 2097152);
      assert.equal(await readlink(join(destination, "link")), "data");
      assert.equal((await lstat(join(destination, "run"))).mode & 0o777, 0o750);
      await lease.upload(destination, "/home/agent/reuploaded");
      const copied = await lease.invoke({
        executable: "sh",
        arguments: [
          "-c",
          "cmp /home/agent/tree/data /home/agent/reuploaded/data && test $(stat -c %a /home/agent/reuploaded/run) = 750 && test -L /home/agent/reuploaded/link || { ls -lR /home/agent/reuploaded; exit 1; }",
        ],
      });
      assert.equal(copied.status, 0, JSON.stringify(copied));
      await mkdir(join(root, "existing"));
      await lease.download("/home/agent/tree", join(root, "existing"));
      assert.equal(
        (await readFile(join(root, "existing", "tree", "data"))).length,
        2097152,
      );
      await lease.download("/home/agent/tree/.", join(root, "contents"));
      assert.equal(
        (await readFile(join(root, "contents", "data"))).length,
        2097152,
      );
      await assert.rejects(
        lease.download("/home/agent/missing", join(root, "missing")),
      );
      for (const format of ["claude", "codex"] as const) {
        const id = "12345678-1234-1234-1234-123456789abc";
        const remote =
          format === "claude"
            ? `/home/agent/.claude/projects/-workspace/${id}.jsonl`
            : `/home/agent/.codex/sessions/rollout-${id}.jsonl`;
        const payload =
          JSON.stringify({ cwd: "/workspace", message: "fixture" }) + "\n";
        assert.equal(
          (
            await lease.invoke({
              executable: "node",
              arguments: [
                "-e",
                "const f=require('node:fs'),p=require('node:path');f.mkdirSync(p.dirname(process.argv[1]),{recursive:true});f.writeFileSync(process.argv[1],process.argv[2]);",
                remote,
                payload,
              ],
            })
          ).status,
          0,
        );
        const captured = await conversations.capture(
          format,
          id,
          root,
          lease,
          join(root, "staging"),
          { home: join(root, "auth-home") },
        );
        assert.match(await readFile(captured.file, "utf8"), /fixture/);
        await lease.invoke({ executable: "rm", arguments: [remote] });
        await conversations.restore(captured, lease, join(root, "staging"));
        const restored = conversations.destination(
          format,
          id,
          lease,
          captured.file,
        );
        assert.match(
          (await lease.invoke({ executable: "cat", arguments: [restored] }))
            .stdout,
          /fixture/,
        );
        assert.equal(
          (
            await lease.invoke({
              executable: "sh",
              arguments: ["-c", `test -w '${restored}'`],
            })
          ).status,
          0,
        );
      }
      const cancelled = AbortSignal.abort(new Error("skip transfer"));
      await assert.rejects(
        lease.upload(join(destination, "data"), "/home/agent/aborted", {
          signal: cancelled,
        }),
        /skip transfer/,
      );
    } finally {
      await lease.release();
    }
  },
);

test(
  "generated image has a writable private home without a tmpfs mount",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async () => {
    assert.match(imageRecipe, /mkdir -p \/home\/agent/);
    const result = await executeProcess({
      executable: process.env.OUTPOST_CONTAINER_ENGINE!,
      arguments: [
        "run",
        "--rm",
        "--network",
        "none",
        "--entrypoint",
        "sh",
        "outpost-ci:latest",
        "-c",
        'test -d "$HOME" && test -w "$HOME" && test "$(stat -c %a "$HOME")" = 700 && touch "$HOME/test-home"',
      ],
    });
    assert.equal(result.status, 0, result.stderr);
  },
);

test(
  "real image diagnostics check both agents and remove containers after success and timeout",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async () => {
    const engine =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker";
    for (const agent of ["codex", "claude"] as const) {
      let name = "";
      const checks = await diagnoseImage(
        { provider: engine, agent, image: "outpost-ci:latest" },
        async (command) => {
          const args = command.arguments ?? [];
          if (args[0] === "create") name = args[args.indexOf("--name") + 1]!;
          const result = await executeProcess(command);
          if (args[0] === "start" && result.status === 0) {
            const inspected = await executeProcess({
              executable: engine,
              arguments: [
                "inspect",
                "--format",
                "{{json .HostConfig.NetworkMode}}",
                name,
              ],
            });
            assert.equal(JSON.parse(inspected.stdout), "none");
          }
          return result;
        },
      );
      assert.ok(
        checks.every((check) => check.status === "pass"),
        JSON.stringify(checks),
      );
      assert.deepEqual(
        checks
          .filter((check) => check.id.startsWith("agent.cli."))
          .map((check) => check.id),
        ["agent.cli.start", "agent.cli.resume", "agent.cli.fork"],
      );
      assert.equal(
        checks.find((check) => check.id === "agent.sandbox")?.version,
        agentVersions[agent],
      );
      await assertContainerRemoved(engine, name);
    }
    let name = "";
    const checks = await diagnoseImage(
      { provider: engine, agent: "codex", image: "outpost-ci:latest" },
      async (command) => {
        const args = command.arguments ?? [];
        if (args[0] === "create") name = args[args.indexOf("--name") + 1]!;
        const inner = args.indexOf("outpost");
        if (inner >= 0 && args[inner + 1] === "codex")
          return executeProcess({
            ...command,
            arguments: [
              ...args.slice(0, inner + 1),
              "node",
              "-e",
              "setTimeout(() => {}, 30000)",
            ],
          });
        return executeProcess(command);
      },
    );
    assert.match(
      checks.find((check) => check.id === "agent.sandbox")!.message,
      /timed out/,
    );
    assert.equal(
      checks.find((check) => check.id === "image.cleanup")?.status,
      "pass",
    );
    await assertContainerRemoved(engine, name);
  },
);

test(
  "interrupting image diagnostics removes the active container",
  {
    skip: !process.env.OUTPOST_CONTAINER_ENGINE || process.platform === "win32",
  },
  async (t) => {
    const engine =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker";
    const child = spawn(
      process.execPath,
      ["test/fixtures/doctor-interruption.ts", engine],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const closed = once(child, "close");
    let output = "",
      error = "",
      name = "",
      interrupted = false;
    child.stderr.on("data", (data: Buffer) => {
      error += data.toString();
    });
    child.stdout.on("data", (data: Buffer) => {
      output += data.toString();
      name = /container=(outpost-[\w-]+)/.exec(output)?.[1] ?? name;
      if (!interrupted && output.includes("ready")) {
        interrupted = true;
        child.kill("SIGTERM");
      }
    });
    const timeout = setTimeout(() => child.kill("SIGKILL"), 20_000);
    t.after(async () => {
      clearTimeout(timeout);
      child.kill("SIGKILL");
      if (name)
        await executeProcess({
          executable: engine,
          arguments: ["rm", "--force", name],
        });
    });
    const [status] = await closed;
    assert.equal(interrupted, true, error);
    assert.equal(status, 143, error);
    assert.ok(name);
    await assertContainerRemoved(engine, name);
  },
);

test(
  "dependency caches persist across leases, invalidate by key and leave authentication homes ephemeral",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const engine =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker";
    const factory = engine === "podman" ? podman : docker;
    const { cacheMounts } = await import("../src/providers/container-cache.ts");
    const user = {
      uid: process.getuid?.() ?? 1000,
      gid: process.getgid?.() ?? 1000,
    };
    const context = {
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    };
    const volumes: string[] = [];
    t.after(async () => {
      for (const volume of volumes)
        await executeProcess({
          executable: engine,
          arguments: ["volume", "rm", volume],
        });
    });
    for (const [key, expected, repositoryMode] of [
      ["v1", "empty", "mounted"],
      ["v1", "retained", "mounted"],
      ["v2", "empty", "mounted"],
      ["v1", "retained", "isolated"],
    ] as const) {
      const caches = [{ name: "npm", key: key! }];
      const mounts = await cacheMounts(caches, root, "outpost-ci:latest", user);
      if (!volumes.includes(mounts[0]!.volume)) volumes.push(mounts[0]!.volume);
      const lease = await factory({
        image: "outpost-ci:latest",
        networks: "none",
        repositoryMode,
        caches,
      }).acquire(context);
      try {
        const result = await lease.invoke({
          executable: "sh",
          arguments: [
            "-c",
            'test ! -e "$HOME/auth-fixture" && test "$(stat -c %a /outpost/cache/npm)" = 700 && test "$(stat -c %u /outpost/cache/npm)" = "$(id -u)" && if test -e /outpost/cache/npm/entry; then echo retained; else echo empty; fi; echo payload > /outpost/cache/npm/entry; echo private > "$HOME/auth-fixture"',
          ],
        });
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout.trim(), expected);
        assert.equal(
          (
            await lease.invoke({
              executable: "cat",
              arguments: ["/outpost/cache/npm/entry"],
            })
          ).stdout,
          "payload\n",
        );
      } finally {
        await lease.release();
      }
    }
  },
);

async function assertContainerRemoved(
  engine: string,
  name: string,
): Promise<void> {
  const result = await executeProcess({
    executable: engine,
    arguments: [
      "ps",
      "--all",
      "--filter",
      `name=${name}`,
      "--format",
      "{{.Names}}",
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "");
}

test(
  "isolated repository keeps host config, hooks and refs private while synchronizing commits",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const { git } = await import("../src/infrastructure/git.ts");
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    await git(root, ["config", "outpost.hostOnly", "private"]);
    const hook = join(root, ".git", "hooks", "pre-commit");
    await writeFile(hook, "host hook sentinel\n");
    const configuration = await readFile(join(root, ".git", "config"));
    const main = await git(root, ["rev-parse", "main"]);
    const box = await createSandbox({
      repository: root,
      provider: factory({
        image: "outpost-ci:latest",
        networks: "none",
        repositoryMode: "isolated",
      }),
      branch: { mode: "named", name: "isolated-test" },
      logging: false,
    });
    try {
      assert.equal(box.root, "/outpost/workspace");
      const command = await box.command({
        executable: "sh",
        arguments: [
          "-c",
          'test -d .git && test ! -e /outpost/git && test ! -e "$1" && test ! -e "$2" && ! git config --get outpost.hostOnly && git config outpost.hostOnly guest && printf "guest hook\\n" > .git/hooks/pre-commit && git update-ref refs/heads/private-guest HEAD && printf "isolated change\\n" > isolated.txt && git add isolated.txt && git -c core.hooksPath=/dev/null commit -m isolated',
          "fixture",
          root,
          box.workspace.directory,
        ],
      });
      assert.equal(command.status, 0, command.stderr);
      assert.equal(
        await readFile(join(box.workspace.directory, "isolated.txt"), "utf8"),
        "isolated change\n",
      );
      assert.equal(
        (
          await git(box.workspace.directory, ["log", "-1", "--format=%s"])
        ).trim(),
        "isolated",
      );
      assert.deepEqual(
        await readFile(join(root, ".git", "config")),
        configuration,
      );
      assert.equal(await readFile(hook, "utf8"), "host hook sentinel\n");
      assert.equal(await git(root, ["rev-parse", "main"]), main);
      await assert.rejects(
        git(root, ["show-ref", "--verify", "refs/heads/private-guest"]),
      );
      const failure = await box.command({
        executable: "sh",
        arguments: ["-c", "exec >/dev/null 2>&1; sleep 1; exit 7"],
      });
      assert.equal(failure.status, 7);
      await assert.rejects(
        box.command({
          executable: "sh",
          arguments: ["-c", "(sleep 2; touch /tmp/isolation-leak) & wait"],
          deadlineMs: 100,
        }),
      );
      assert.equal(
        (
          await box.command({
            executable: "sh",
            arguments: ["-c", "sleep 2; test ! -e /tmp/isolation-leak"],
          })
        ).status,
        0,
      );
    } finally {
      await box.close();
    }
  },
);

test(
  "isolated synchronization preserves dirty and concurrently edited host workspaces",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const { openWorkspace } = await import("../src/index.ts");
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    for (const concurrent of [false, true]) {
      const workspace = await openWorkspace({
        repository: root,
        branch: {
          mode: "named",
          name: concurrent ? "concurrent-test" : "dirty-test",
        },
      });
      if (!concurrent)
        await writeFile(join(workspace.directory, "base.txt"), "host edit\n");
      const box = await workspace.sandbox({
        provider: factory({
          image: "outpost-ci:latest",
          networks: "none",
          repositoryMode: "isolated",
        }),
        logging: false,
      });
      try {
        if (concurrent)
          await writeFile(join(workspace.directory, "base.txt"), "host edit\n");
        await assert.rejects(
          box.command({
            executable: "sh",
            arguments: ["-c", "echo guest > base.txt"],
          }),
          /recovery files retained/,
        );
        assert.equal(
          await readFile(join(workspace.directory, "base.txt"), "utf8"),
          "host edit\n",
        );
        const { readdir } = await import("node:fs/promises");
        assert.ok(
          (await readdir(join(root, ".outpost", "recovery"))).length > 0,
        );
      } finally {
        await box.close();
        await workspace.close({ preserve: true });
      }
    }
  },
);

test(
  "real container deny-all blocks raw IP egress while commands remain usable",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
    const lease = await factory({
      image: "outpost-ci:latest",
      egress: { mode: "deny-all" },
    }).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    try {
      const probe = await lease.invoke({
        executable: "node",
        arguments: [
          "-e",
          `
      const assert = require('node:assert/strict');
      const os = require('node:os');
      const net = require('node:net');
      assert.ok(Object.values(os.networkInterfaces()).flat().every(address => address.internal));
      const socket = net.connect({ host: '192.0.2.1', port: 443 });
      socket.setTimeout(2000, () => { socket.destroy(); process.exit(2); });
      socket.on('connect', () => { socket.destroy(); process.exit(3); });
      socket.on('error', error => { assert.equal(error.code, 'ENETUNREACH'); });
    `,
        ],
      });
      assert.equal(probe.status, 0, probe.stderr);
      assert.equal(
        (await lease.invoke({ executable: "sh", arguments: ["-c", "exit 7"] }))
          .status,
        7,
      );
      assert.equal((await lease.invoke({ executable: "true" })).status, 0);
    } finally {
      await lease.release();
    }
  },
);
