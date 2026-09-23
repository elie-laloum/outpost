import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  initialize,
  manageImage,
  type Template,
} from "../../src/cli/scaffold.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import type { Command } from "../../src/domain/ports.ts";
import { repository } from "../helpers.ts";

test("all five starters support ESM detection and refuse overwrites", async (t) => {
  const root = await repository(t);
  for (const template of [
    "blank",
    "iterate",
    "review",
    "plan",
    "plan-review",
  ] as Template[]) {
    const path = join(root, template);
    await mkdir(path);
    await writeFile(
      join(path, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    const result = await initialize({
      directory: path,
      template,
      model: 'model"quoted',
      provider: "docker",
      tracker: "custom",
    });
    assert.equal(result.run, "node .outpost/run.ts");
    const source = join(path, ".outpost", "run.ts");
    const checked = await executeProcess({
      executable: process.execPath,
      arguments: ["--check", source],
    });
    assert.equal(checked.status, 0, checked.stderr);
    assert.match(
      await readFile(join(path, ".outpost", "Dockerfile"), "utf8"),
      /@openai\/codex/,
    );
    await assert.rejects(initialize({ directory: path }), /overwrite/);
  }
});

test("initialization supports cloud peers, trackers and requested package manager", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  const result = await initialize(
    {
      directory: root,
      agent: "claude",
      provider: "vercel",
      manager: "pnpm",
      install: true,
      tracker: "github",
      label: "outpost-ready",
    },
    executor,
  );
  assert.equal(result.run, "node .outpost/run.mts");
  assert.ok(
    calls.some((call) => call.arguments?.join(" ").includes("@vercel/sandbox")),
  );
  assert.ok(calls.some((call) => call.executable === "gh"));
  assert.match(
    await readFile(join(root, ".outpost", ".env.example"), "utf8"),
    /^GH_TOKEN=$/m,
  );
  assert.match(
    await readFile(join(root, ".outpost", "tickets.mts"), "utf8"),
    /githubBacklog\(\{ label: "outpost-ready" \}\)/,
  );
  for (const [provider, tracker] of [
    ["daytona", "beads"],
    ["podman", "custom"],
    ["local", "custom"],
  ] as const) {
    const folder = join(root, provider);
    await mkdir(folder);
    await initialize(
      { directory: folder, provider, tracker, install: true, manager: "yarn" },
      executor,
    );
  }
});

test("image management uses explicit Dockerfile and numeric build arguments", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  assert.equal(
    await manageImage(
      "build",
      {
        directory: root,
        engine: "podman",
        image: "custom:1",
        file: "custom.Containerfile",
        uid: 1234,
        gid: 2345,
      },
      executor,
    ),
    "custom:1",
  );
  assert.ok(calls[0]?.arguments?.includes("AGENT_UID=1234"));
  assert.ok(calls[0]?.arguments?.includes(join(root, "custom.Containerfile")));
  await manageImage("remove", { directory: root }, executor);
  assert.deepEqual(calls[1]?.arguments?.slice(0, 2), ["image", "rm"]);
  await assert.rejects(manageImage("build", { uid: -1 }, executor), /UID/);
});
