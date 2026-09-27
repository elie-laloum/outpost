import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { test } from "node:test";

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  test(
    `doctor ${signal} stops its host probe and descendants`,
    {
      skip: process.platform === "win32",
      timeout: 15_000,
    },
    async (t) => {
      const directory = await mkdtemp(join(tmpdir(), "outpost-doctor-stop-"));
      const ready = join(directory, "ready.json");
      const stopped = join(directory, "stopped");
      const descendantStopped = join(directory, "descendant-stopped");
      const script = `#!${process.execPath}
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const child = spawn(process.execPath, ["--input-type=module", "-e", ${JSON.stringify(`import { writeFileSync } from "node:fs"; process.on("SIGTERM", () => { writeFileSync(${JSON.stringify(descendantStopped)}, "stopped"); process.exit(0); }); console.log("ready"); setInterval(() => {}, 1000);`)}], { stdio: ["ignore", "pipe", "ignore"] });
process.on("SIGTERM", () => { writeFileSync(${JSON.stringify(stopped)}, "stopped"); process.exit(0); });
child.stdout.once("data", () => writeFileSync(${JSON.stringify(ready)}, JSON.stringify({ pid: process.pid, descendant: child.pid })));
setInterval(() => {}, 1000);
`;
      await writeFile(join(directory, "git"), script);
      await chmod(join(directory, "git"), 0o700);
      const child = spawn(
        process.execPath,
        ["src/cli/main.ts", "doctor", "--sandbox-provider", "local", "--json"],
        {
          env: { ...process.env, PATH: directory },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      const closed = once(child, "close");
      let pid: number | undefined;
      let stderr = "";
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      t.after(async () => {
        child.kill("SIGKILL");
        if (pid) {
          try {
            process.kill(-pid, "SIGKILL");
          } catch {}
        }
        await closed;
        await rm(directory, { recursive: true, force: true });
      });
      for (let index = 0; index < 250; index++) {
        try {
          const value: unknown = JSON.parse(await readFile(ready, "utf8"));
          assert.ok(value && typeof value === "object" && "pid" in value);
          assert.equal(typeof value.pid, "number");
          if (typeof value.pid !== "number")
            throw new Error("Invalid probe PID");
          pid = value.pid;
          break;
        } catch {
          await pause(20);
        }
      }
      assert.ok(pid, `Probe did not start: ${stderr}`);
      child.kill(signal);
      const [status, exitSignal] = await closed;
      assert.equal(status, signal === "SIGINT" ? 130 : 143, stderr);
      assert.equal(exitSignal, null);
      assert.equal(await readFile(stopped, "utf8"), "stopped");
      assert.equal(await readFile(descendantStopped, "utf8"), "stopped");
      assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
    },
  );
}
