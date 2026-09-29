// Redis queue (BullMQ) — the queue from demo 16, on Redis, for workers spread over machines.
// Outpost refuses a Redis that may evict queue state: maxmemory-policy must be "noeviction".
// Needs Docker (a throwaway Redis is started) and the optional `bullmq` package.

import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { defineQueuedTask, defineWorkflow, runQueueWorker } from "@elie-laloum/outpost";
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
import { model, modelProvider } from "../shared/model.ts";


// 0. A throwaway Redis, configured like a cache: it evicts keys when memory is full.
const docker = (...args: string[]) => execFileSync("docker", args, { encoding: "utf8" }).trim();
const redis = (...args: string[]) => docker("exec", container, "redis-cli", ...args);

const container = docker("run", "-d", "--rm", "-p", "127.0.0.1::6379", "redis:7-alpine", "redis-server", "--maxmemory-policy", "allkeys-lru");
const ready = () => {
  try {
    return redis("ping") === "PONG";
  } catch {
    return false; // not listening yet
  }
};
while (!ready()) await sleep(100);

const connection = { host: "127.0.0.1", port: Number(docker("port", container, "6379/tcp").split(":").at(-1)) };


try {
  // 1. Eviction could silently drop a job or a worker's lock: the queue refuses to open.
  //    (The "IMPORTANT!" line comes from BullMQ itself.)
  console.log("1. maxmemory-policy = allkeys-lru");
  await createBullMQTaskQueue({ name: "translations", connection }).then(
    () => console.log("  accepté ?!"),
    (error) => console.log("  refusé :", (error as Error).message),
  );


  // 2. Outpost never changes the server's configuration: that's the operator's job.
  console.log("\n2. maxmemory-policy = noeviction");
  redis("CONFIG", "SET", "maxmemory-policy", "noeviction");

  const queue = await createBullMQTaskQueue({ name: "translations", connection });
  const stop = new AbortController();

  const worker = runQueueWorker({
    queue,
    worker: "translator",
    signal: stop.signal,
    pollMs: 200,
    handlers: {
      async translate(input, { signal }) {
        const answer = await modelProvider.request({
          model: model.name,
          reasoning: model.reasoning,
          prompt: `Translate to English. Reply with the translation only.\n\n${input}`,
          signal,
        });
        return { value: answer.text.trim() };
      },
    },
  });

  const sentences = ["Bonjour tout le monde", "À demain !"];
  const translations = sentences.map((sentence, index) =>
    defineQueuedTask({ key: `translate-${index}`, queue, handler: "translate", input: () => sentence, decode: String, pollMs: 200 }),
  );

  try {
    const result = await defineWorkflow("translations", translations).start();
    result.unwrap();
    translations.forEach((translation, index) => console.log(`  ${sentences[index]} → ${result.value(translation)}`));
  } finally {
    stop.abort();
    await worker;
    await queue.close();
  }
} finally {
  docker("stop", container);
}
