import { DatabaseSync } from "node:sqlite";
import { createHttpTaskQueue, runQueueWorker } from "../../src/index.ts";
import { createBullMQTaskQueue } from "../../src/infrastructure/task-queue-bullmq.ts";

const [backend, configuration, effects, mode] = process.argv.slice(2);
if (!configuration || !effects) throw new Error("Missing worker configuration");
const options = JSON.parse(configuration);
const queue =
  backend === "redis"
    ? await createBullMQTaskQueue(options)
    : createHttpTaskQueue(options);
const database = new DatabaseSync(effects);
database.exec(
  "PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS effects (key TEXT PRIMARY KEY)",
);
const stop = new AbortController();
process.on("SIGTERM", () => stop.abort());
try {
  await runQueueWorker({
    queue: {
      ...queue,
      async complete(lease, result) {
        const job = await queue.complete(lease, result);
        stop.abort();
        return job;
      },
    },
    worker: `process-${process.pid}`,
    signal: stop.signal,
    leaseMs: 500,
    pollMs: 20,
    handlers: {
      async work(_input, context) {
        const result = database
          .prepare("INSERT OR IGNORE INTO effects (key) VALUES (?)")
          .run(context.idempotencyKey);
        process.send?.("effect");
        if (mode === "crash") await new Promise<void>(() => {});
        return {
          value: {
            key: context.idempotencyKey,
            inserted: Number(result.changes),
          },
        };
      },
    },
  });
} finally {
  database.close();
  if ("close" in queue && typeof queue.close === "function")
    await queue.close();
  process.disconnect?.();
}
