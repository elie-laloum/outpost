import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  symlink,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import {
  createCopilotConversations,
  copilotSessionProfile,
} from "../../src/adapters/agents/copilot/copilot-conversations.ts";
import {
  createKimiConversations,
  kimiSessionProfile,
} from "../../src/adapters/agents/kimi/kimi-conversations.ts";
import {
  sessionBundleCommand,
  sessionBundleProfile,
} from "../../src/infrastructure/conversations/session-bundle.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import {
  createTransportConversations,
  createLocalTransport,
} from "../../src/index.ts";
import { seedSession, sessionDirectory } from "../fixtures/native-session.ts";
import { repository } from "../helpers.ts";

const nativeConversations = (format: "copilot" | "kimi") =>
  format === "kimi" ? createKimiConversations() : createCopilotConversations();
const profiles = { copilot: copilotSessionProfile, kimi: kimiSessionProfile };

function lease(home: string, root: string): SandboxLease {
  const copy = async (from: string, to: string) => {
    await mkdir(dirname(to), { recursive: true });
    await cp(from, to);
  };
  return {
    home,
    root,
    upload: copy,
    download: copy,
    async release() {},
    invoke: (command) =>
      executeProcess({
        ...command,
        executable:
          command.executable === "node" ? process.execPath : command.executable,
        variables: {
          ...command.variables,
          KIMI_CODE_HOME: join(home, ".kimi-code"),
          COPILOT_HOME: join(home, ".copilot"),
        },
      }),
  };
}

for (const format of ["copilot", "kimi"] as const) {
  test(`${format} captures complete native context and restores it across homes and repository paths`, async (t) => {
    const root = await repository(t),
      home = join(root, "source"),
      destination = join(root, "target"),
      id = "session_original";
    const source = await seedSession(format, home, "/old/repo", id);
    const asset =
      format === "kimi" ? "agents/main/image.bin" : "files/image.bin";
    await mkdir(dirname(join(source, asset)), { recursive: true });
    const bytes = Buffer.from([0, 255, 128, 1]);
    await writeFile(join(source, asset), bytes);
    await mkdir(join(source, "logs"), { recursive: true });
    await writeFile(join(source, "logs", "private.log"), "excluded");
    const store = nativeConversations(format);
    const record = await store.capture(id, {
      repository: root,
      sandbox: lease(home, "/old/repo"),
      staging: join(root, "staging"),
    });
    const before = await readFile(record.file);
    await writeFile(record.file, "{}");
    await assert.rejects(
      store.locate(id, root),
      /Invalid native session bundle/,
    );
    await writeFile(record.file, before);
    assert.equal((await store.locate(id, root)).file, record.file);
    await store.restore(record, {
      repository: root,
      sandbox: lease(destination, "/new/repo"),
      staging: join(root, "staging"),
    });
    const restored = sessionDirectory(format, destination, "/new/repo", id);
    assert.deepEqual(await readFile(join(restored, asset)), bytes);
    const metadata = await readFile(
      join(restored, format === "kimi" ? "state.json" : "workspace.yaml"),
      "utf8",
    );
    assert.ok(metadata.includes("/new/repo"));
    assert.ok(!metadata.includes("/old/repo"));
    assert.deepEqual(await readFile(record.file), before);
    await assert.rejects(
      readFile(join(restored, "logs/private.log")),
      /ENOENT/,
    );
    assert.deepEqual(await readdir(join(destination, ".outpost")), []);
    await store.restore(record, {
      repository: root,
      sandbox: lease(destination, "/new/repo"),
      staging: root,
    });
    const backups = await readdir(
      join(
        destination,
        format === "kimi" ? ".kimi-code" : ".copilot",
        ".outpost-recovery",
      ),
    );
    assert.equal(backups.length, 1);
    await assert.rejects(
      store.restore(
        { ...record, format: "wrong" },
        {
          repository: root,
          sandbox: lease(destination, "/new/repo"),
          staging: root,
        },
      ),
      /does not match/,
    );
  });

  test(`${format} transport archives every native session file and rejects corrupt restoration`, async (t) => {
    const root = await repository(t),
      home = join(root, "source"),
      destination = join(root, "target"),
      id = "session_transport";
    await seedSession(format, home, "/source", id);
    const store = createTransportConversations(format, {
      namespace: "test",
      transporter: createLocalTransport({ directory: join(root, "objects") }),
    });
    const record = await store.capture(id, {
      repository: root,
      sandbox: lease(home, "/source"),
      staging: join(root, "staging"),
    });
    assert.ok(record.reference);
    const found = await store.locate(id, root);
    await store.restore(found, {
      repository: root,
      sandbox: lease(destination, "/destination"),
      staging: root,
    });
    const copied = sessionDirectory(format, destination, "/destination", id);
    assert.match(
      await readFile(
        join(
          copied,
          format === "kimi" ? "agents/main/plans/plan.md" : "plan.md",
        ),
        "utf8",
      ),
      /remember me/,
    );
    const bundle = JSON.parse(await readFile(found.file, "utf8"));
    bundle.files.push({ path: "../escaped", data: "" });
    await writeFile(found.file, JSON.stringify(bundle));
    await assert.rejects(
      store.restore(found, {
        repository: root,
        sandbox: lease(destination, "/destination"),
        staging: root,
      }),
      /Invalid native session entry/,
    );
    assert.match(
      await readFile(
        join(
          copied,
          format === "kimi" ? "agents/main/plans/plan.md" : "plan.md",
        ),
        "utf8",
      ),
      /remember me/,
    );
    await assert.rejects(
      nativeConversations(format).locate("../escape", root),
      /Invalid conversation/,
    );
  });

  test(`${format} rejects missing native data, symlinks and bounded capture overflow`, async (t) => {
    const root = await repository(t),
      home = join(root, "source"),
      id = "session_bounds";
    const store = nativeConversations(format),
      sandbox = lease(home, root);
    await assert.rejects(
      store.capture(id, { repository: root, sandbox, staging: root }),
      /missing|incomplete/,
    );
    const dir = await seedSession(format, home, root, id);
    const link = format === "kimi" ? "agents/main/link" : "files/link";
    await mkdir(dirname(join(dir, link)), { recursive: true });
    if (process.platform !== "win32") {
      await symlink(join(root, "base.txt"), join(dir, link));
      await assert.rejects(
        store.capture(id, { repository: root, sandbox, staging: root }),
        /Unsafe native session/,
      );
    }
    const command = sessionBundleCommand(
      "capture",
      sessionBundleProfile(profiles[format]),
      id,
      home,
      root,
      join(root, "small.json"),
    );
    const args = [...command.arguments!];
    args[args.length - 2] = "1";
    const result = await sandbox.invoke({ ...command, arguments: args });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /limits exceeded|Unsafe native session/);
  });
}
