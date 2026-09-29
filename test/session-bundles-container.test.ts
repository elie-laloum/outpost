import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { conversations } from "../src/index.ts";
import { createLocalSandboxProvider } from "../src/providers/local.ts";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../src/providers/podman.ts";
import { seedSession } from "./fixtures/native-session.ts";
import { repository } from "./helpers.ts";

for (const format of ["copilot", "kimi"] as const) {
  test(
    `real container restores and captures ${format} session files through the live home`,
    { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
    async (t) => {
      const root = await repository(t),
        home = join(root, "source"),
        id = "session_container";
      const host = await createLocalSandboxProvider().acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      });
      t.after(() => host.release());
      const source = {
        ...host,
        home,
        invoke: (command: Parameters<typeof host.invoke>[0]) =>
          host.invoke({
            ...command,
            variables: {
              KIMI_CODE_HOME: join(home, ".kimi-code"),
              COPILOT_HOME: join(home, ".copilot"),
            },
          }),
      };
      await seedSession(format, home, "/original", id);
      const store = conversations.native(format);
      const record = await store.capture(id, {
        repository: root,
        sandbox: source,
        staging: root,
      });
      const factory =
        process.env.OUTPOST_CONTAINER_ENGINE === "podman"
          ? createPodmanSandboxProvider
          : createDockerSandboxProvider;
      const sandbox = await factory({
        image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
        networks: "none",
      }).acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      });
      t.after(() => sandbox.release());
      await store.restore(record, { repository: root, sandbox, staging: root });
      const inspected = await sandbox.invoke({
        executable: "node",
        arguments: [
          "-e",
          `const fs=require('node:fs'),p=require('node:path'); const base=p.join(process.argv[1],process.argv[2]==='kimi'?'.kimi-code/sessions':'.copilot/session-state'); function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=p.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name==='plan.md')process.stdout.write(fs.readFileSync(f));}}walk(base);`,
          sandbox.home,
          format,
        ],
      });
      assert.equal(inspected.status, 0, inspected.stderr);
      assert.equal(inspected.stdout, "remember me");
      const captured = await store.capture(id, {
        repository: root,
        sandbox,
        staging: root,
        home: join(root, "captured"),
      });
      assert.ok((await readFile(captured.file, "utf8")).includes(id));
    },
  );
}
