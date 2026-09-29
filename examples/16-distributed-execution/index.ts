// Distributed execution — a durable queue separates who asks for the work from who does it.
// Everything runs on one machine here, but the coordinator and the worker could be separate.

import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  createHttpTaskQueue,
  createSqliteTaskQueue,
  defineQueuedTask,
  defineWorkflow,
  runQueueWorker,
  serveTaskQueue,
} from "@elie-laloum/outpost";
import { model, modelProvider } from "../shared/model.ts";

// 1. The queue: stored in SQLite, exposed over HTTP with a token.
const state = join(import.meta.dirname, "state");
await mkdir(state, { recursive: true });

const storage = await createSqliteTaskQueue(join(state, "jobs.sqlite"));
const token = randomBytes(32).toString("hex");
const server = await serveTaskQueue({ queue: storage, token, port: 0 });
const queue = createHttpTaskQueue({ url: server.url, token });

// 2. The worker: claims jobs and runs its handlers (here, a model call).
const stop = new AbortController();

const worker = runQueueWorker({
  queue,
  worker: "translator",
  signal: stop.signal,
  handlers: {
    async translate(input) {
      const answer = await modelProvider.request({
        model: model.name,
        reasoning: model.reasoning,
        prompt: `Translate to English. Reply with the translation only.\n\n${input}`,
      });

      return { value: answer.text.trim() };
    },
  },
});

// 3. The coordinator: a workflow where every task goes through the queue.
const sentences = ["Bonjour tout le monde", "Le café est prêt", "À demain !"];

const translations = sentences.map((sentence, index) =>
  defineQueuedTask({
    key: `translate-${index}`,
    queue,
    handler: "translate",
    input: () => sentence,
    decode: (value) => String(value),
  }),
);

try {
  const result = await defineWorkflow("translations", translations).start();
  result.unwrap();

  translations.forEach((translation, index) =>
    console.log(sentences[index], "→", result.value(translation)),
  );
} finally {
  stop.abort();
  await worker;
  await server.close();
  storage.close();
}
