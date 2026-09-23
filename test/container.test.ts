import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSandbox, codex, claude } from "../src/index.ts";
import { docker } from "../src/providers/docker.ts";
import { podman } from "../src/providers/podman.ts";
import { repository } from "./helpers.ts";

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
    t.after(() => box.close());
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
        "sleep 3; test ! -e cancellation-leak.txt; test ! -S /var/run/docker.sock",
      ],
    });
    assert.equal(verify.status, 0);
    const env = await box.command({
      executable: "printenv",
      arguments: ["OUTPOST_FIXTURE"],
      variables: { OUTPOST_FIXTURE: "injected" },
    });
    assert.equal(env.stdout.trim(), "injected");
  },
);
