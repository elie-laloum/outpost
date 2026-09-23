import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createSandbox, codex, claude } from "../src/index.ts";
import { docker } from "../src/providers/docker.ts";
import { podman } from "../src/providers/podman.ts";
import { repository } from "./helpers.ts";
import type { AgentEvent } from "../src/index.ts";

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
      const tracker = await box.command({
        executable: "bd",
        arguments: ["--version"],
      });
      assert.equal(tracker.status, 0, tracker.stderr);
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
      const destination = join(root, "downloaded tree");
      await lease.download("/home/agent/transfer inputs", destination);
      assert.deepEqual(
        await readFile(join(destination, "nested folder", "binary file.bin")),
        bytes,
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
