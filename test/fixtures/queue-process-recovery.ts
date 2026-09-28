import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { fork } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { TaskQueue } from "../../src/index.ts";

export async function verifyProcessRecovery(
  t: TestContext,
  queue: TaskQueue,
  backend: "http" | "redis",
  configuration: object,
) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-effect-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const effects = join(directory, "effects.sqlite");
  const id = "process-recovery";
  await queue.enqueue({ id, handler: "work", input: null });
  const start = (mode: string) => {
    const child = fork(
      new URL("./queue-effect-worker.ts", import.meta.url),
      [backend, JSON.stringify(configuration), effects, mode],
      { stdio: ["ignore", "ignore", "pipe", "ipc"] },
    );
    let stderr = "";
    child.stderr!.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    const exited = once(child, "exit");
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null)
        child.kill("SIGKILL");
      await exited;
    });
    return { child, exited, stderr: () => stderr };
  };
  const first = start("crash");
  const effect = once(first.child, "message");
  await Promise.race([
    effect,
    first.exited.then(() => {
      throw new Error(first.stderr());
    }),
  ]);
  const initial = await queue.get(id);
  assert.equal(initial?.status, "active");
  first.child.kill("SIGKILL");
  await first.exited;
  const successor = start("finish");
  const [code] = await successor.exited;
  assert.equal(code, 0, successor.stderr());
  const done = await queue.get(id);
  assert.equal(done?.status, "done");
  assert.equal(
    JSON.stringify(done.result?.value),
    JSON.stringify({ key: id, inserted: 0 }),
  );
  assert.ok(done.fence > initial!.fence);
  await assert.rejects(
    queue.complete(
      { id, worker: initial!.worker!, fence: initial!.fence },
      { value: "stale" },
    ),
  );
  const database = new DatabaseSync(effects);
  try {
    assert.equal(
      database.prepare("SELECT count(*) AS total FROM effects").get()!.total,
      1,
    );
  } finally {
    database.close();
  }
}
