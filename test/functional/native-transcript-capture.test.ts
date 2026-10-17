import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import {
  createClaudeConversations,
  createCodexConversations,
  createObservationHub,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

test("local masked capture preserves the native transcript and its sidecars", async (t) => {
  const root = await repository(t);
  const home = join(root, ".outpost", "native-home");
  const store = createClaudeConversations();
  const id = "local-capture";
  const native = join(store.directory(root, home), `${id}.jsonl`);
  const child = join(dirname(native), id, "subagents", "child.jsonl");
  const text = JSON.stringify({ cwd: root, text: "secret-value" }) + "\n";
  await mkdir(dirname(child), { recursive: true });
  await writeFile(native, text);
  await writeFile(child, text);
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const context = {
    repository: root,
    home,
    local: true,
    sandbox: { ...lease, home },
    staging: join(root, ".outpost", "staging"),
    observation: createObservationHub({ redact: [/secret-value/g] }),
  };
  const captured = await store.capture(id, context);
  assert.notEqual(captured.file, native);
  assert.equal(await readFile(native, "utf8"), text);
  assert.equal(await readFile(child, "utf8"), text);
  assert.match(await readFile(captured.file, "utf8"), /REDACTED/);
  assert.match(
    await readFile(
      join(dirname(captured.file), id, "subagents", "child.jsonl"),
      "utf8",
    ),
    /REDACTED/,
  );
  assert.equal((await store.locate(id, root, home)).file, native);
  await store.restore(captured, context);
  assert.equal(await readFile(native, "utf8"), text);
  const plain = await store.capture(id, {
    ...context,
    observation: createObservationHub(),
  });
  assert.equal(plain.file, native);
  assert.equal(await readFile(native, "utf8"), text);
});

test("Codex captures and restores a rollout under its original date", async (t) => {
  const root = await repository(t);
  const home = join(root, ".outpost", "native-home");
  const capturedHome = join(root, ".outpost", "captured-home");
  const store = createCodexConversations();
  const id = "11111111-1111-4111-8111-111111111111";
  const native = join(
    home,
    ".codex",
    "sessions",
    "2020",
    "01",
    "02",
    `rollout-2020-01-02T00-00-00-${id}.jsonl`,
  );
  await mkdir(dirname(native), { recursive: true });
  await writeFile(native, '{"text":"first"}\n');
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const context = {
    repository: root,
    home: capturedHome,
    local: true,
    sandbox: { ...lease, home },
    staging: join(root, ".outpost", "staging"),
  };
  const nativeCapture = await store.capture(id, { ...context, home });
  assert.equal(nativeCapture.file, native);
  const first = await store.capture(id, context);
  assert.equal(
    first.file,
    join(
      capturedHome,
      ".codex",
      "sessions",
      "2020",
      "01",
      "02",
      basename(native),
    ),
  );
  await writeFile(native, '{"text":"first"}\n{"text":"continued"}\n');
  const second = await store.capture(id, context);
  assert.equal(second.file, first.file);
  assert.match(
    await readFile((await store.locate(id, root, capturedHome)).file, "utf8"),
    /continued/,
  );
  const restoredHome = join(root, ".outpost", "restored-home");
  await store.restore(second, {
    ...context,
    local: false,
    sandbox: { ...lease, home: restoredHome },
  });
  assert.equal(
    await readFile(
      join(
        restoredHome,
        ".codex",
        "sessions",
        "2020",
        "01",
        "02",
        basename(native),
      ),
      "utf8",
    ),
    await readFile(second.file, "utf8"),
  );
  const duplicate = join(
    capturedHome,
    ".codex",
    "sessions",
    "2021",
    "01",
    "01",
    basename(native),
  );
  await mkdir(dirname(duplicate), { recursive: true });
  await copyFile(first.file, duplicate);
  await assert.rejects(
    store.locate(id, root, capturedHome),
    /multiple|ambiguous/i,
  );
  // Remote capture searches with POSIX find, which a Windows host lease lacks.
  if (process.platform !== "win32")
    await assert.rejects(
      store.capture(id, {
        ...context,
        local: false,
        sandbox: { ...lease, home: capturedHome },
      }),
      /multiple|ambiguous/i,
    );
});

test("local worktree capture preserves its live transcript and refreshes the relocated continuation", async (t) => {
  const root = await repository(t);
  const worktree = join(root, ".outpost", "worktree");
  const home = join(root, ".outpost", "home");
  const store = createClaudeConversations();
  const id = "continued";
  const original = join(store.directory(root, home), `${id}.jsonl`);
  const live = join(store.directory(worktree, home), `${id}.jsonl`);
  await mkdir(dirname(original), { recursive: true });
  await mkdir(dirname(live), { recursive: true });
  await mkdir(worktree, { recursive: true });
  await writeFile(original, '{"text":"previous secret"}\n');
  await writeFile(live, '{"text":"continued secret"}\n');
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: worktree,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const captured = await store.capture(id, {
    repository: root,
    home,
    local: true,
    sandbox: { ...lease, home },
    staging: join(root, ".outpost", "staging"),
    observation: createObservationHub({ redact: [/secret/g] }),
  });
  assert.equal(captured.file, original);
  assert.equal(await readFile(live, "utf8"), '{"text":"continued secret"}\n');
  assert.match(await readFile(captured.file, "utf8"), /continued \[REDACTED\]/);
  assert.equal((await store.locate(id, root, home)).file, captured.file);
});
