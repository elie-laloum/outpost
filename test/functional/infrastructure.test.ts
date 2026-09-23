import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  executeProcess,
  requireSuccess,
  quote,
} from "../../src/infrastructure/process.ts";
import { resolveVariables } from "../../src/infrastructure/settings.ts";
import {
  captureConversation,
  locateConversation,
  projectKey,
  relocateTranscript,
  restoreConversation,
} from "../../src/infrastructure/conversations.ts";
import { local } from "../../src/providers/local.ts";
import {
  copySelected,
  safeDestination,
} from "../../src/infrastructure/files.ts";
import { repository } from "../helpers.ts";

test("process supervision streams all output while retaining a bounded tail and propagates failures", async () => {
  let streamed = "";
  const command = {
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdout.write('é'.repeat(1000)); process.stderr.write('problem')",
    ],
    retain: 8,
    observe: (channel: string, text: string) => {
      if (channel === "stdout") streamed += text;
    },
  };
  const result = await executeProcess(command);
  assert.equal(streamed.length, 1000);
  assert.equal(result.stdout, "é".repeat(8));
  assert.equal(result.stderr, "problem");
  await assert.rejects(
    requireSuccess({
      executable: process.execPath,
      arguments: ["-e", "process.exit(3)"],
    }),
    /status 3/,
  );
  await assert.rejects(
    executeProcess({
      executable: process.execPath,
      arguments: ["-e", "setInterval(()=>{},100)"],
      deadlineMs: 40,
    }),
    /exceeded/,
  );
  await assert.rejects(
    executeProcess({ executable: "outpost-nonexistent-program" }),
  );
  assert.throws(() => quote("\0"), /NUL/);
  assert.equal(quote("it's"), "'it'\"'\"'s'");
});

test("environment precedence is explicit and provider/agent overlap is rejected", async (t) => {
  const root = await repository(t);
  await mkdir(join(root, ".outpost"));
  await writeFile(join(root, ".env"), "A=root\nB=root\n");
  await writeFile(join(root, ".outpost", ".env"), "B=local\nC=local\n");
  assert.deepEqual(
    await resolveVariables(
      root,
      { AGENT: "agent" },
      { PROVIDER: "provider" },
      { A: "process", UNDECLARED: "hidden" },
    ),
    {
      B: "local",
      C: "local",
      AGENT: "agent",
      PROVIDER: "provider",
    },
  );
  await assert.rejects(
    resolveVariables(root, { A: "x" }, { A: "y" }),
    /overlap/,
  );
});

test("copies skip absent optional inputs and reject traversal", async (t) => {
  const root = await repository(t),
    target = join(root, "target");
  await mkdir(target);
  await copySelected(root, target, ["base.txt"]);
  assert.equal(await readFile(join(target, "base.txt"), "utf8"), "base\n");
  for (const name of ["../outside", ".git/config", "nested/../../escape"])
    await assert.rejects(safeDestination(root, name), /Unsafe/);
  await copySelected(root, target, ["missing", "base.txt"]);
  assert.equal(await readFile(join(target, "base.txt"), "utf8"), "base\n");
});

test("native conversation transfer rewrites cwd without changing message text", async (t) => {
  const root = await repository(t),
    home = join(root, "home"),
    remote = join(root, "remote");
  await mkdir(remote);
  await mkdir(home);
  const id = "test-conversation",
    folder = join(home, ".claude", "projects", projectKey(root));
  await mkdir(join(folder, id, "subagents"), { recursive: true });
  const native =
    JSON.stringify({ cwd: root, text: root, nested: { cwd: root } }) + "\n";
  await writeFile(join(folder, `${id}.jsonl`), native);
  await writeFile(join(folder, id, "subagents", "agent-child.jsonl"), native);
  const found = await locateConversation("claude", id, root, home);
  const base = await local().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  const lease = { ...base, home: join(root, "remote-home") };
  const staging = join(root, "stage");
  await restoreConversation(found, lease, staging);
  const saved = await captureConversation("claude", id, root, lease, staging, {
    home,
    local: true,
  });
  assert.equal(saved.file, found.file);
  assert.deepEqual(
    JSON.parse((await readFile(saved.file, "utf8")).trim()),
    JSON.parse(native),
  );
  const output = relocateTranscript(native + "invalid line\n", remote);
  assert.equal(JSON.parse(output.split("\n")[0]!).text, root);
  assert.ok(output.includes("invalid line"));
  const codexPath = join(home, ".codex", "sessions", "2026", "09", "23");
  await mkdir(codexPath, { recursive: true });
  await writeFile(
    join(codexPath, `rollout-2026-09-23T00-00-00-${id}.jsonl`),
    native,
  );
  const codex = await locateConversation("codex", id, root, home);
  await restoreConversation(codex, lease, staging);
  assert.equal(
    (
      await captureConversation("codex", id, root, lease, staging, {
        home,
        local: true,
      })
    ).id,
    id,
  );
  await assert.rejects(
    locateConversation("codex", "missing", root, home),
    /not found/,
  );
  await base.release();
});
