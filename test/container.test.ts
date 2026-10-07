import { createAgent as composeAgent } from "../src/domain/agent.ts";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { diagnoseImage } from "../src/application/doctor-image.ts";
import { agentVersions } from "../src/providers/versions.constants.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile, readlink, lstat } from "node:fs/promises";
import { join } from "node:path";
import {
  createSandbox,
  createAgentConflictResolver,
  openWorkspace,
  recoveryDetails,
  dispatch,
  readJournal,
  createReplayAgent,
  createCodexHarness,
  createClaudeHarness,
  createCopilotHarness,
  createSteering,
  createKimiHarness,
  createHarness,
  defineMcpPrompt,
} from "../src/index.ts";
import type { ModelRequest } from "../src/index.ts";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../src/providers/podman.ts";
import { conversationStore, repository } from "./helpers.ts";
import type {
  AgentEvent,
  AgentInput,
  AgentLiveInput,
  SteeringDelivery,
} from "../src/index.ts";
import { executeProcess } from "../src/infrastructure/process.ts";
import { repositoryTransport } from "../src/infrastructure/repository-transport.ts";
import { git } from "../src/infrastructure/git.ts";
import { imageRecipe } from "../src/cli/scaffold.constants.ts";

const containerImage =
  process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest";

test(
  "real container supports Git, native CLIs, transfers, cancellation and warm reuse",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t),
      sandboxProvider =
        process.env.OUTPOST_CONTAINER_ENGINE === "podman"
          ? createPodmanSandboxProvider
          : createDockerSandboxProvider;
    const box = await createSandbox({
      repository: root,
      sandboxProvider: sandboxProvider({
        image: containerImage,
        networks: "none",
      }),
      agent: composeAgent({ harness: createCodexHarness({}) }),
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
      for (const adapter of [
        composeAgent({ harness: createCodexHarness({}) }),
        composeAgent({ harness: createClaudeHarness({}) }),
      ]) {
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
      const live = new PassThrough();
      const streamed = box.command({
        executable: "sh",
        arguments: [
          "-c",
          'read first; echo "received:$first"; read second; echo "$first:$second" > live-input.txt; exit 5',
        ],
        stdin: "one\n",
        input: live,
        observe(channel, text) {
          if (channel === "stdout" && text.includes("received:one"))
            live.end("two\n");
        },
      });
      assert.equal((await streamed).status, 5);
      const liveFile = await box.command({
        executable: "cat",
        arguments: ["live-input.txt"],
      });
      assert.equal(liveFile.stdout, "one:two\n");
      const output = await box.dispatch({
        agent: {
          kind: "cli" as const,
          harness: {
            kind: "cli" as const,
            bind() {
              throw new Error("Already bound fixture");
            },
          },
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
  "real container steers agents through live stdin and interrupted resumption",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const sandboxProvider =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const fixture = (
      name: string,
      script: (input: AgentInput) => string,
      liveInput?: AgentLiveInput,
    ) => ({
      kind: "cli" as const,
      harness: {
        kind: "cli" as const,
        bind() {
          throw new Error("Already bound fixture");
        },
      },
      name,
      resumable: true,
      ...(liveInput ? { liveInput } : {}),
      request: (input: AgentInput) => ({
        executable: "node",
        arguments: ["-e", script(input)],
        stdin: input.liveInput ? `${input.text ?? ""}\n` : (input.text ?? ""),
      }),
      events: (line: string) => [JSON.parse(line) as AgentEvent],
    });
    const live = fixture(
      "live-fixture",
      () =>
        "const rl=require('readline').createInterface({input:process.stdin});const seen=[];rl.on('line',l=>{seen.push(l);console.log(JSON.stringify({kind:'text',text:'ack:'+l}));if(seen.length===2){console.log(JSON.stringify({kind:'result',text:seen.join('|')+' <outpost>done</outpost>'}));console.log(JSON.stringify({kind:'finished'}))}});rl.on('close',()=>process.exit(0));",
      {
        open: () => ({
          encode: (text) => `${text}\n`,
          read: (line) => ({
            consumed: line.includes("ack:") ? 1 : 0,
            replies: [],
          }),
        }),
      },
    );
    const interrupted = fixture("interrupt-fixture", (input) =>
      input.continuation
        ? `console.log(JSON.stringify({kind:'text',text:'resumed:'+${JSON.stringify(input.text ?? "")}+' <outpost>done</outpost>'}))`
        : "console.log(JSON.stringify({kind:'conversation',id:'container-conv'}));setInterval(()=>{},1000);",
    );
    const box = await createSandbox({
      repository: root,
      sandboxProvider: sandboxProvider({
        image: containerImage,
        networks: "none",
      }),
      agent: live,
      logging: false,
    });
    try {
      const steering = createSteering();
      let injected: Promise<SteeringDelivery> | undefined;
      const first = await box.dispatch({
        brief: { text: "first" },
        steering,
        observe(event) {
          if (event.kind === "text" && !injected)
            injected = steering.send("second");
        },
      });
      assert.deepEqual(await injected, { mode: "injected" });
      assert.equal(first.completed, true);
      assert.match(first.text, /first\|second/);
      let resumed: Promise<SteeringDelivery> | undefined;
      const second = await box.dispatch({
        agent: interrupted,
        brief: { text: "work" },
        steering,
        observe(event) {
          if (event.kind === "conversation" && !resumed)
            resumed = steering.send("new direction");
        },
      });
      assert.deepEqual(await resumed, { mode: "resumed" });
      assert.equal(second.turns[0]!.interrupted, "steering");
      assert.match(second.text, /resumed:new direction/);
      assert.equal((await box.command({ executable: "true" })).status, 0);
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
        process.env.OUTPOST_CONTAINER_ENGINE === "podman"
          ? createPodmanSandboxProvider
          : createDockerSandboxProvider;
    const input = join(root, "transfer inputs");
    await mkdir(join(input, "nested folder"), { recursive: true });
    const bytes = Buffer.from([0, 1, 2, 255, 128, 10, 13, 0]);
    await writeFile(join(input, "nested folder", "binary file.bin"), bytes);
    const mounted = join(root, "mounted.txt");
    await writeFile(mounted, "read-only source");
    const lease = await factory({
      image: containerImage,
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
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const lease = await factory({
      image: containerImage,
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
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const lease = await factory({
      image: containerImage,
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
        const store = conversationStore(format);
        const captured = await store.capture(id, {
          repository: root,
          sandbox: lease,
          staging: join(root, "staging"),
          home: join(root, "auth-home"),
        });
        assert.match(await readFile(captured.file, "utf8"), /fixture/);
        await lease.invoke({ executable: "rm", arguments: [remote] });
        await store.restore(captured, {
          repository: lease.root,
          sandbox: lease,
          staging: join(root, "staging"),
        });
        const restored = store.destination(id, lease, captured.file);
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
        containerImage,
        "-c",
        'test -d "$HOME" && test -w "$HOME" && test "$(stat -c %a "$HOME")" = 700 && touch "$HOME/test-home"',
      ],
    });
    assert.equal(result.status, 0, result.stderr);
  },
);

test(
  "real image diagnostics check all bundled agents and remove containers after success and timeout",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async () => {
    const engine =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker";
    for (const agent of [
      "codex",
      "claude",
      "antigravity",
      "copilot",
      "kimi",
    ] as const) {
      let name = "";
      const checks = await diagnoseImage(
        { sandboxProvider: engine, agent, image: containerImage },
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
        agent === "codex" || agent === "claude" || agent === "kimi"
          ? ["agent.cli.start", "agent.cli.resume", "agent.cli.fork"]
          : ["agent.cli.start", "agent.cli.resume"],
      );
      const version = checks.find(
        (check) => check.id === "agent.sandbox",
      )?.version;
      assert.equal(version, agentVersions[agent]);
      await assertContainerRemoved(engine, name);
    }
    let name = "";
    const checks = await diagnoseImage(
      { sandboxProvider: engine, agent: "codex", image: containerImage },
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
    const factory =
      engine === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
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
      const mounts = await cacheMounts(caches, root, containerImage, user);
      if (!volumes.includes(mounts[0]!.volume)) volumes.push(mounts[0]!.volume);
      const lease = await factory({
        image: containerImage,
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
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    await git(root, ["config", "outpost.hostOnly", "private"]);
    const hook = join(root, ".git", "hooks", "pre-commit");
    await writeFile(hook, "host hook sentinel\n");
    const configuration = await readFile(join(root, ".git", "config"));
    const main = await git(root, ["rev-parse", "main"]);
    const box = await createSandbox({
      repository: root,
      sandboxProvider: factory({
        image: "outpost-ci:latest",
        networks: "none",
        repositoryMode: "isolated",
      }),
      branch: { mode: "named", name: "isolated-test" },
      logging: false,
    });
    try {
      assert.equal(box.root, "/tmp/outpost/workspace");
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
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
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
        sandboxProvider: factory({
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
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
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

test(
  "session token readers see the private container home for Copilot and Kimi",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const provider =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    await using box = await createSandbox({
      repository: root,
      sandboxProvider: provider({ image: containerImage, networks: "none" }),
      logging: false,
    });
    for (const kind of ["copilot", "kimi"] as const) {
      const adapter = composeAgent({
        harness:
          kind === "copilot" ? createCopilotHarness() : createKimiHarness(),
      });
      const selected = {
        ...adapter,
        capture: false,
        resumable: false,
        request: () => ({
          executable: "node",
          arguments: [
            "-e",
            `
            const { mkdirSync, writeFileSync } = require("node:fs");
            const { join, dirname } = require("node:path");
            const { homedir } = require("node:os");
            const kind = ${JSON.stringify(kind)};
            const file = kind === "copilot"
              ? join(homedir(), ".copilot/session-state/session_fixture/events.jsonl")
              : join(homedir(), ".kimi-code/sessions/workspace/session_fixture/agents/main/wire.jsonl");
            mkdirSync(dirname(file), { recursive: true });
            const record = kind === "copilot"
              ? { type: "session.shutdown", data: { modelMetrics: { model: { usage: {
                inputTokens: 7, outputTokens: 2, cacheReadTokens: 3, cacheWriteTokens: 1
              } } } } }
              : { type: "usage.record", usage: { inputOther: 7, output: 2, inputCacheRead: 3, inputCacheCreation: 1 } };
            writeFileSync(file, JSON.stringify(record) + "\\n");
            const final = kind === "copilot"
              ? { type: "result", exitCode: 0, sessionId: "session_fixture" }
              : { role: "meta", type: "session.resume_hint", session_id: "session_fixture" };
            console.log(JSON.stringify(final));
          `,
          ],
        }),
      };
      const result = await box.dispatch({
        agent: selected,
        brief: { text: "fixture" },
      });
      assert.deepEqual(result.usage, {
        input: 7,
        output: 2,
        cached: 3,
        cacheCreated: 1,
      });
      assert.equal((await box.command({ executable: "true" })).status, 0);
    }
  },
);

test(
  "real container recovery removes an orphan by its persisted identity and preserves mounted work",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const provider = (
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider
    )({ image: containerImage, networks: "none" });
    let resourceId = "";
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [join(root, ".git")],
      variables: {},
      registerRecovery: async (id) => {
        resourceId = id;
      },
    });
    t.after(() => lease.release().catch(() => {}));
    const command = await lease.invoke({
      executable: "sh",
      arguments: ["-c", "printf recovered > recovery.txt; exit 7"],
    });
    assert.equal(command.status, 7);
    assert.ok(resourceId);
    await provider.recover!(resourceId, { deadlineMs: 10_000 });
    await provider.recover!(resourceId, { deadlineMs: 10_000 });
    assert.equal(
      await readFile(join(root, "recovery.txt"), "utf8"),
      "recovered",
    );
    const removed = await lease.invoke({ executable: "true" });
    assert.notEqual(removed.status, 0);
  },
);

test(
  "durable interactive tasks release containers between questions and restore files and history",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const {
      createAgent,
      createHarness,
      defineHarnessTool,
      defineInteractiveAgentTask,
      defineWorkflow,
      createWorkflowCheckpointStore,
      createLocalTransport,
    } = await import("../src/index.ts");
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const provider = factory({ image: containerImage, networks: "none" });
    const checkpoint = {
      store: createWorkflowCheckpointStore({
        transporter: createLocalTransport({
          directory: join(root, ".outpost", "storage"),
        }),
      }),
      runId: "interview",
      version: "1",
    };
    let calls = 0;
    const make = () =>
      defineInteractiveAgentTask({
        key: "ask",
        repository: root,
        actors: ["owner"],
        brief: "Prepare a draft, ask its subject, then verify the draft.",
        sandboxProvider: provider,
        bootstrap: false,
        agent: createAgent({
          model: "fixture",
          harness: createHarness({
            tools: [
              defineHarnessTool({
                name: "draft",
                description: "Write or verify the draft in the sandbox.",
                input: {
                  type: "object",
                  properties: { verify: { type: "boolean" } },
                  required: ["verify"],
                  additionalProperties: false,
                },
                async execute(input: { verify: boolean }, context) {
                  const result = await context.sandbox.invoke({
                    executable: "sh",
                    arguments: [
                      "-c",
                      input.verify
                        ? 'test "$(cat draft.txt)" = preserved && printf verified'
                        : "printf preserved > draft.txt",
                    ],
                  });
                  assert.equal(result.status, 0, result.stderr);
                  return input.verify ? result.stdout : "written";
                },
              }),
            ],
            modelProvider: {
              name: "container-interview",
              async request(request) {
                calls++;
                const usage = { input: 1, cached: 0, output: 1 };
                if (calls === 1 || calls === 3)
                  return {
                    text: "",
                    content: [
                      {
                        type: "tool-call",
                        id: `call-${calls}`,
                        name: "draft",
                        input: { verify: calls === 3 },
                      },
                    ],
                    stopReason: "tool-calls",
                    usage,
                  };
                if (calls === 4) {
                  assert.match(
                    JSON.stringify(request.messages),
                    /human-subject/,
                  );
                  assert.match(JSON.stringify(request.messages), /verified/);
                }
                const value =
                  calls === 2
                    ? { kind: "question", question: "Subject?" }
                    : { kind: "completed", output: "verified" };
                const text = `<interaction>${JSON.stringify(value)}</interaction>`;
                return {
                  text,
                  content: [{ type: "text", text }],
                  stopReason: "end",
                  usage,
                };
              },
            },
          }),
        }),
      });
    const first = await defineWorkflow("interview", [make()]).start({
      checkpoint,
    });
    assert.equal(
      first.status,
      "waiting-input",
      first.errors.map(String).join(),
    );
    const pending = first.inputRequests[0]!;
    const next = make();
    const result = await defineWorkflow("interview", [next]).start({
      checkpoint,
      answers: [
        {
          executionId: first.executionId,
          key: pending.key,
          requestId: pending.id,
          actor: "owner",
          value: "human-subject",
        },
      ],
    });
    result.unwrap();
    assert.equal(result.value(next).output, "verified");
    assert.equal(calls, 4);
    assert.equal(
      await readFile(join(result.value(next).directory, "draft.txt"), "utf8"),
      "preserved",
    );
  },
);

test(
  "real container replays recorded commits through the sandbox",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const sandboxProvider = (
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider
    )({ image: containerImage, networks: "none" });
    const fixture = {
      kind: "cli" as const,
      harness: {
        kind: "cli" as const,
        bind() {
          throw new Error("Already bound fixture");
        },
      },
      name: "replay-fixture",
      request: () => ({
        executable: "node",
        arguments: [
          "-e",
          `const fs = require("node:fs"); const { execFileSync } = require("node:child_process");
          fs.writeFileSync("binary.bin", Buffer.from([0, 255, 7]));
          fs.writeFileSync("notes.txt", "caf\u00e9\\n");
          execFileSync("git", ["add", "."]);
          execFileSync("git", ["commit", "-m", "Container replay"]);
          console.log(JSON.stringify({ kind: "text", text: "<outpost>done</outpost>" }));`,
        ],
      }),
      events: (line: string) => [JSON.parse(line) as AgentEvent],
    };
    const transporter = repositoryTransport(root);
    const recorded = await dispatch({
      repository: root,
      sandboxProvider,
      agent: fixture,
      branch: { mode: "named", name: "recorded" },
      brief: { text: "Record in a container" },
      logging: { transporter, replayable: true },
    });
    assert.equal(recorded.commits.length, 1);
    const replayed = await dispatch({
      repository: root,
      sandboxProvider,
      agent: createReplayAgent({
        journal: await readJournal({
          transporter,
          reference: recorded.logReference!,
        }),
      }),
      branch: { mode: "named", name: "replayed" },
      brief: { text: "Record in a container" },
      logging: false,
    });
    assert.deepEqual(replayed.commits, recorded.commits);
    assert.equal(
      await git(root, ["rev-parse", "replayed^{tree}"]),
      await git(root, ["rev-parse", "recorded^{tree}"]),
    );
  },
);

test(
  "real container runs built-in harness MCP servers over streamed stdio",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    await writeFile(
      join(root, "mcp-server.mjs"),
      await readFile(new URL("./fixtures/mcp-server.mjs", import.meta.url)),
    );
    const sandboxProvider =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const replies = [
      (request: ModelRequest) => {
        assert.match(request.system ?? "", /user: Review ts code\./);
        return {
          text: "",
          stopReason: "tool-calls" as const,
          usage: { input: 1, cached: 0, output: 1 },
          content: [
            {
              type: "tool-call" as const,
              id: "call-1",
              name: "mcp__fixture__env",
              input: { name: "HOME" },
            },
            {
              type: "tool-call" as const,
              id: "call-2",
              name: "mcp_read_resource",
              input: { server: "fixture", uri: "file:///readme.md" },
            },
          ],
        };
      },
      (request: ModelRequest) => {
        const outputs = (request.messages?.at(-1)?.content ?? []).map(
          (block) => (block.type === "tool-result" ? block.content : ""),
        );
        assert.deepEqual(outputs, ["/home/agent", "# Readme"]);
        return {
          text: "<outpost>done</outpost>",
          usage: { input: 1, cached: 0, output: 1 },
        };
      },
    ];
    const box = await createSandbox({
      repository: root,
      sandboxProvider: sandboxProvider({
        image: containerImage,
        networks: "none",
      }),
      logging: false,
    });
    try {
      const result = await box.dispatch({
        agent: composeAgent({
          model: "fixture",
          harness: createHarness({
            modelProvider: {
              name: "fixture",
              async request(request) {
                return replies.shift()!(request);
              },
            },
            mcpServers: {
              fixture: {
                command: "node",
                arguments: ["mcp-server.mjs", "rich"],
                environment: { MCP_LOG: "mcp.log" },
              },
            },
            instructions: [
              defineMcpPrompt({
                server: "fixture",
                name: "review",
                arguments: { lang: "ts" },
              }),
            ],
          }),
        }),
        brief: { text: "Use MCP inside the container" },
      });
      assert.equal(result.completed, true);
      const log = await readFile(
        join(box.workspace.directory, "mcp.log"),
        "utf8",
      );
      assert.match(log, /"closed":true/);
    } finally {
      await box.close();
    }
  },
);

for (const repositoryMode of ["mounted", "isolated"] as const) {
  test(
    `real container resolves conflicts and gates integration (${repositoryMode})`,
    { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
    async (t) => {
      const root = await repository(t);
      const provider =
        process.env.OUTPOST_CONTAINER_ENGINE === "podman"
          ? createPodmanSandboxProvider
          : createDockerSandboxProvider;
      const sandboxProvider = provider({
        image: containerImage,
        networks: "none",
        repositoryMode,
      });
      const agent = composeAgent({
        harness: {
          kind: "cli",
          bind: () => ({
            name: "conflict-fixture",
            request: () => ({
              executable: "sh",
              arguments: [
                "-c",
                "set -eu; test -n \"$(git ls-files --unmerged)\"; printf 'host + candidate\\n' > base.txt; git add base.txt; git -c core.hooksPath=/dev/null -c commit.gpgSign=false commit -m Resolve >/dev/null; printf 'done\\n'",
              ],
            }),
            events: () => [{ kind: "text", text: "done" }],
          }),
        },
      });
      for (const status of [0, 7]) {
        await using workspace = await openWorkspace({
          repository: root,
          branch: { mode: "integrate" },
        });
        await writeFile(
          join(workspace.directory, "base.txt"),
          `candidate-${status}\n`,
        );
        await git(workspace.directory, ["commit", "-am", "Candidate"]);
        await writeFile(join(root, "base.txt"), `host-${status}\n`);
        await git(root, ["commit", "-am", "Host"]);
        const host = (await git(root, ["rev-parse", "HEAD"])).trim();
        const onConflict = createAgentConflictResolver(agent, {
          sandboxProvider,
          logging: false,
          verify: {
            executable: "node",
            arguments: [
              "-e",
              status === 0
                ? "if(require('node:fs').readFileSync('base.txt','utf8') !== 'host + candidate\\n')process.exit(9)"
                : "process.exit(7)",
            ],
          },
        });
        if (status === 0) {
          const result = await workspace.integrate({ onConflict });
          assert.ok(result);
          assert.equal(result.verification.status, 0);
          assert.equal(
            (await git(root, ["rev-parse", "HEAD"])).trim(),
            result.commit,
          );
          assert.equal(
            await readFile(join(root, "base.txt"), "utf8"),
            "host + candidate\n",
          );
          continue;
        }
        await assert.rejects(workspace.integrate({ onConflict }), (error) => {
          assert.equal(typeof recoveryDetails(error)?.directory, "string");
          return true;
        });
        assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
        assert.equal(
          await readFile(join(root, "base.txt"), "utf8"),
          "host-7\n",
        );
        assert.equal((await git(root, ["ls-files", "--unmerged"])).trim(), "");
      }
    },
  );
}
