import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  createClaudeConversations,
  createCodexConversations,
} from "../../src/index.ts";
import { claudeConversationLayout } from "../../src/adapters/agents/claude/claude-conversations.ts";
import { codexConversationLayout } from "../../src/adapters/agents/codex/codex-conversations.ts";
import { createTranscriptConversations } from "../../src/infrastructure/conversations/transcript-store.ts";
import { projectKey } from "../../src/infrastructure/conversations/identity.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

for (const [variable, create, layout, path] of [
  [
    "CLAUDE_CONFIG_DIR",
    createClaudeConversations,
    claudeConversationLayout,
    (root: string, id: string) =>
      join("projects", projectKey(root), `${id}.jsonl`),
  ],
  [
    "CODEX_HOME",
    createCodexConversations,
    codexConversationLayout,
    (_root: string, id: string) =>
      join(
        "sessions",
        "2026",
        "10",
        "20",
        `rollout-2026-10-20T00-00-00-${id}.jsonl`,
      ),
  ],
] as const) {
  test(`${variable} is used for local capture and restore, independently of the archive home`, async (t) => {
    const root = await repository(t);
    const configured = join(root, "cli-home");
    const archive = join(root, "archive-home");
    const id = "configured-session";
    const file = join(configured, path(root, id));
    const original = JSON.stringify({ cwd: root, text: "hello" }) + "\n";
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, original);
    if (layout.sidecars) {
      const child = join(dirname(file), id, "subagents", "child.jsonl");
      await mkdir(dirname(child), { recursive: true });
      await writeFile(child, original);
    }
    const lease = await createLocalSandboxProvider().acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: { [variable]: configured },
    });
    t.after(() => lease.release());
    const store = create();
    const context = {
      repository: root,
      sandbox: { ...lease, home: join(root, "default-home") },
      home: archive,
      staging: join(root, "staging"),
      local: true,
    };
    await assert.rejects(
      createTranscriptConversations(layout).capture(id, context),
      /not found/,
    );
    const captured = await store.capture(id, context);
    assert.equal(captured.file, (await store.locate(id, root, archive)).file);
    assert.notEqual(captured.file, file);
    assert.equal(await readFile(file, "utf8"), original);
    assert.equal(await readFile(captured.file, "utf8"), original);
    if (layout.sidecars)
      assert.equal(
        await readFile(
          join(dirname(captured.file), id, "subagents", "child.jsonl"),
          "utf8",
        ),
        original,
      );

    const next = join(root, "next-workspace");
    await mkdir(next);
    const nextLease = await createLocalSandboxProvider().acquire({
      repository: root,
      directory: next,
      gitDirectories: [],
      variables: { [variable]: configured },
    });
    t.after(() => nextLease.release());
    await store.restore(captured, { ...context, sandbox: nextLease });
    const restored = join(configured, path(next, id));
    assert.equal(JSON.parse(await readFile(restored, "utf8")).cwd, next);
    if (layout.sidecars)
      assert.equal(
        JSON.parse(
          await readFile(
            join(dirname(restored), id, "subagents", "child.jsonl"),
            "utf8",
          ),
        ).cwd,
        next,
      );

    const previous = process.env[variable];
    process.env[variable] = configured;
    t.after(() => {
      if (previous === undefined) delete process.env[variable];
      else process.env[variable] = previous;
    });
    assert.equal((await store.locate(id, next)).file, restored);
    assert.equal((await store.locate(id, root, archive)).file, captured.file);
    assert.ok(store.directory(next).startsWith(configured));

    const remoteHome = join(root, "remote-home");
    const remote = { ...nextLease, home: remoteHome };
    await store.restore(captured, {
      ...context,
      local: false,
      sandbox: remote,
    });
    const remoteFile = store.destination(id, remote, captured.file);
    assert.ok(remoteFile.startsWith(remoteHome));
    assert.equal(JSON.parse(await readFile(remoteFile, "utf8")).cwd, next);
  });
}
