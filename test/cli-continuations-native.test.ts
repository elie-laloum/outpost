import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { kimiHarness, conversations } from "../src/index.ts";
import { localSandboxProvider } from "../src/providers/local.ts";
import { seedSession, sessionDirectory } from "./fixtures/native-session.ts";
import { repository } from "./helpers.ts";

test(
  "installed Kimi forks a restored synthetic session without model access",
  { skip: !process.env.OUTPOST_NATIVE_KIMI },
  async (t) => {
    const root = await repository(t),
      sourceHome = join(root, "source"),
      targetHome = join(root, "target");
    await mkdir(targetHome, { recursive: true });
    const id = "session_synthetic",
      sandboxProvider = localSandboxProvider();
    const nativeLease = await sandboxProvider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => nativeLease.release());
    const withHome = (home: string) => ({
      ...nativeLease,
      home,
      invoke: (command: Parameters<typeof nativeLease.invoke>[0]) =>
        nativeLease.invoke({
          ...command,
          variables: {
            ...command.variables,
            HOME: home,
            KIMI_CODE_HOME: join(home, ".kimi-code"),
            KIMI_CODE_NO_AUTO_UPDATE: "1",
          },
        }),
    });
    const source = withHome(sourceHome),
      target = withHome(targetHome);
    await seedSession("kimi", sourceHome, "/original/workspace", id);
    const store = conversations.native("kimi");
    const record = await store.capture(id, {
      repository: root,
      sandbox: source,
      staging: root,
    });
    await store.restore(record, {
      repository: root,
      sandbox: target,
      staging: root,
    });
    const before = await readFile(
      join(sessionDirectory("kimi", targetHome, root, id), "state.json"),
    );
    const fork = kimiHarness().bind().fork!;
    const child = await fork(id, (command) =>
      target.invoke({
        ...command,
        executable: process.env.OUTPOST_NATIVE_KIMI!,
        deadlineMs: 30_000,
      }),
    );
    assert.notEqual(child, id);
    assert.deepEqual(
      await readFile(
        join(sessionDirectory("kimi", targetHome, root, id), "state.json"),
      ),
      before,
    );
    const captured = await store.capture(child, {
      repository: root,
      sandbox: target,
      staging: root,
    });
    assert.equal(captured.id, child);
    const childMeta = JSON.parse(
      await readFile(
        join(sessionDirectory("kimi", targetHome, root, child), "state.json"),
        "utf8",
      ),
    );
    assert.equal(childMeta.forkedFrom, id);
    assert.equal(childMeta.cwd, root);
  },
);
