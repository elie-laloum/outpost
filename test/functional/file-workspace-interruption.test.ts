import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { createRecipeRuntime } from "../../src/recipes.ts";
import {
  inspectFileWorkspace,
  recoverFileWorkspace,
  inspectWorkspacePathLocks,
  recoverWorkspacePathLock,
} from "../../src/index.ts";

async function evidence(path: string): Promise<string> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const value = await readFile(path, "utf8").catch((error) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return undefined;
      throw error;
    });
    if (value) return value;
    await delay(10);
  }
  throw new Error("Interrupted file command did not start");
}

test(
  "SIGKILL file workflow recovery and interrupted replay require separate explicit authorization",
  { skip: process.platform === "win32", timeout: 20000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "outpost-file-interruption-"));
    let commandPid: number | undefined;
    let child: ReturnType<typeof spawn> | undefined;
    try {
      const file = join(root, "recipe.yaml"),
        config = join(root, "outpost.yaml");
      const pidFile = join(root, "command.pid"),
        replay = join(root, "replay");
      await writeFile(
        file,
        JSON.stringify({
          version: 3,
          name: "interruption",
          workflow: {
            checkpoint: {
              store: { $ref: "stores.state" },
              runId: "interrupted",
              version: "1",
            },
          },
          tasks: [
            {
              key: "completed",
              command: {
                executable: process.execPath,
                arguments: [
                  "-e",
                  "require('fs').appendFileSync('completed.txt','once\\n')",
                ],
              },
            },
            {
              key: "interrupted",
              after: ["completed"],
              command: {
                executable: process.execPath,
                arguments: [
                  "-e",
                  "const fs=require('fs');fs.appendFileSync('attempts.txt','attempt\\n');fs.writeFileSync(process.argv[1],String(process.pid));if(!fs.existsSync(process.argv[2]))setInterval(()=>{},1000)",
                  pidFile,
                  replay,
                ],
                deadlineMs: 10000,
              },
            },
          ],
        }),
      );
      await writeFile(
        config,
        JSON.stringify({
          version: 3,
          runtime: { directory: "./control", namespace: "interrupted" },
          workspace: { kind: "ephemeral", retention: { policy: "local" } },
          sandbox: { provider: "local" },
          transports: { state: { type: "local", directory: "./state" } },
          stores: {
            state: {
              type: "transport",
              transporter: { $ref: "transports.state" },
            },
          },
        }),
      );
      child = spawn(
        process.execPath,
        [
          resolve("src/cli/main.ts"),
          "recipe",
          "run",
          "--file",
          file,
          "--config",
          config,
          "--no-interactive",
        ],
        { stdio: "ignore" },
      );
      commandPid = Number(await evidence(pidFile));
      assert.ok(Number.isSafeInteger(commandPid) && commandPid > 0);
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
      process.kill(-commandPid, "SIGKILL");
      commandPid = undefined;
      await using runtime = await createRecipeRuntime({ file, config });
      const interrupted = await runtime.status("interrupted");
      assert.ok(interrupted?.owned);
      assert.equal(
        interrupted.tasks.find((task) => task.key === "completed")?.status,
        "done",
      );
      assert.equal(
        interrupted.tasks.find((task) => task.key === "interrupted")?.status,
        "active",
      );
      const saved = interrupted.workspaces.shared?.fileRecord;
      assert.ok(saved);
      const inspection = await inspectFileWorkspace({
        runtime: saved.runtime,
        id: saved.id,
      });
      const recovered = await recoverFileWorkspace(inspection.record, {
        expectedRevision: inspection.reference.revision,
        processesStopped: true,
        recover: {
          processesStopped: true,
          allocationReleased: true,
          adoptInterruptedFiles: true,
        },
      });
      await recovered.checkpoint();
      await recovered.close({ preserve: true });
      const refused = await runtime.resume({
        runId: "interrupted",
        recoverRevision: interrupted.revision,
        signal: AbortSignal.timeout(5000),
      });
      assert.equal(refused.status, "failed");
      assert.match(
        JSON.stringify(refused.errors),
        /retryIncomplete|interrupted|replay/i,
      );
      assert.equal(
        await readFile(join(saved.directory, "completed.txt"), "utf8"),
        "once\n",
      );
      assert.equal(
        await readFile(join(saved.directory, "attempts.txt"), "utf8"),
        "attempt\n",
      );
      await writeFile(replay, "authorized");
      const current = await inspectFileWorkspace({
        runtime: saved.runtime,
        id: saved.id,
      });
      const resumed = await runtime.resume({
        runId: "interrupted",
        retryIncomplete: true,
        workspaceRecovery: {
          shared: {
            expectedRevision: current.reference.revision,
            processesStopped: true,
            allocationReleased: true,
            adoptInterruptedFiles: true,
          },
        },
      });
      assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
      assert.equal(
        await readFile(join(saved.directory, "completed.txt"), "utf8"),
        "once\n",
      );
      assert.equal(
        await readFile(join(saved.directory, "attempts.txt"), "utf8"),
        "attempt\nattempt\n",
      );
    } finally {
      if (child && child.exitCode === null && child.signalCode === null) {
        const exit = once(child, "exit");
        child.kill("SIGKILL");
        await exit;
      }
      if (commandPid) {
        try {
          process.kill(-commandPid, "SIGKILL");
        } catch (error) {
          if (!(
            error instanceof Error &&
            "code" in error &&
            error.code === "ESRCH"
          ))
            throw error;
        }
      }
      for (const lock of await inspectWorkspacePathLocks())
        if (lock.directory.startsWith(`${root}/`))
          await recoverWorkspacePathLock(lock.id, lock.directory, {
            processesStopped: true,
          });
      await rm(root, { recursive: true, force: true });
    }
  },
);
