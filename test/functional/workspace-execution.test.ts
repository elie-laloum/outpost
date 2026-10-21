import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createWorkspace,
  openWorkspace,
  restoreFileWorkspace,
} from "../../src/workspaces.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import { emit, repository, scripted } from "../helpers.ts";

test("Git workspace methods retain borrowed ownership across cold continuation and attachment", async (t) => {
  const root = await repository(t);
  const saved = join(root, ".outpost", "fixture");
  await mkdir(saved, { recursive: true });
  const restored: string[] = [];
  const captured: string[] = [];
  const agent: CliAgent = {
    ...scripted((input) => {
      const id = input.continuation?.fork ? "forked" : "original";
      return `console.log(JSON.stringify({kind:"conversation",id:${JSON.stringify(id)}}));${emit(input.continuation ? id : "first")}`;
    }),
    storage: {
      name: "workspace-fixture",
      async locate(id) {
        return { id, file: join(saved, id), format: "fixture" };
      },
      async capture(id) {
        captured.push(id);
        const file = join(saved, id);
        await writeFile(file, id);
        return { id, file, format: "fixture" };
      },
      async restore(record) {
        assert.equal(await readFile(record.file, "utf8"), record.id);
        restored.push(record.id);
      },
    },
  };
  const sandboxProvider = createLocalSandboxProvider();
  await using workspace = await openWorkspace({ repository: root });
  const first = await workspace.dispatch({
    agent,
    sandboxProvider,
    logging: false,
    brief: { text: "first" },
  });
  assert.equal(first.text, "first");
  const resumed = await first.resume({ brief: { text: "resume" } });
  assert.equal(resumed.text, "original");
  assert.equal((await first.fork({ brief: { text: "fork" } })).text, "forked");
  assert.deepEqual(restored, ["original", "original"]);
  assert.deepEqual(captured, ["original", "original", "forked"]);
  assert.equal(
    (
      await workspace.attach({
        agent: scripted("process.exit(7)"),
        sandboxProvider,
      })
    ).status,
    7,
  );
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    logging: false,
  });
  await assert.rejects(workspace.close(), /Close the sandbox/);
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
});

test("restored file workspaces retain sandbox and dispatch methods without acquiring Git ownership", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "outpost-workspace-execution-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sandboxProvider = createLocalSandboxProvider();
  const workspace = await createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: root },
  });
  t.after(() => workspace.close());
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    logging: false,
  });
  await sandbox.command({
    executable: process.execPath,
    arguments: ["-e", "require('node:fs').writeFileSync('saved','content')"],
  });
  await sandbox.close();
  const reader: CliAgent = {
    ...scripted(
      "import fs from 'node:fs';console.log(JSON.stringify({kind:'text',text:fs.readFileSync('saved','utf8')}))",
    ),
    fileWorkspaces: { dispatch: true },
  };
  assert.equal(
    (
      await workspace.dispatch({
        agent: reader,
        sandboxProvider,
        logging: false,
        brief: { text: "read" },
      })
    ).text,
    "content",
  );
  const record = await workspace.checkpoint();
  await workspace.close({ preserve: true });
  await using restored = await restoreFileWorkspace(record);
  assert.equal(
    (
      await restored.dispatch({
        agent: reader,
        sandboxProvider,
        logging: false,
        brief: { text: "read again" },
      })
    ).text,
    "content",
  );
  await using resumedSandbox = await restored.sandbox({
    sandboxProvider,
    logging: false,
  });
  assert.equal(
    (
      await resumedSandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(7)"],
      })
    ).status,
    7,
  );
});
