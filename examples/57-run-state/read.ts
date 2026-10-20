import { join } from "node:path";
import { createLocalTransport, createObservation } from "@elie-laloum/outpost";
import { demoRepository } from "../shared/repository.ts";
const id = process.argv[2];
if (!id)
  throw new Error("Usage: node examples/57-run-state/read.ts <id> [--watch]");
const repository = demoRepository(import.meta.dirname);
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
await using observation = createObservation({ transporter });
const run = await observation.readRun(id);
if (!run) throw new Error(`Unknown run: ${id}`);
console.log(JSON.stringify(run, null, 2));
if (process.argv.includes("--watch")) {
  const controller = new AbortController();
  process.once("SIGINT", () => controller.abort());
  try {
    for await (const event of observation.watchRun(id, {
      from: run.seq,
      signal: controller.signal,
    }))
      console.log(event);
  } catch (error) {
    if (!controller.signal.aborted) throw error;
  }
}
