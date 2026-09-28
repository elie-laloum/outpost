import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import { localTransport } from "../../src/infrastructure/local-transport.ts";
import {
  openSpeculationStore,
  recoverSpeculation,
} from "../../src/infrastructure/speculation-store.ts";
import { repository } from "../helpers.ts";

test("speculation storage fences stale owners and refuses concurrent acquisition", async (t) => {
  const root = await repository(t);
  const transporter = localTransport({ directory: join(root, "store") });
  const first = await openSpeculationStore(transporter, "run");
  await first.save({ completed: false });
  await assert.rejects(
    openSpeculationStore(transporter, "run"),
    /already owned/,
  );
  for await (const object of transporter.list()) {
    await recoverSpeculation({
      transporter,
      runId: "run",
      revision: object.revision,
      coordinatorStopped: true,
    });
  }
  const second = await openSpeculationStore(transporter, "run");
  assert.deepEqual(second.initial, { completed: false });
  await assert.rejects(first.save({ completed: true }), /conflict/i);
  await assert.rejects(first.release(), /conflict/i);
  await second.save({ completed: true });
  await second.release();
  await second.release();
  await assert.rejects(second.save(null), /closed/);
  const third = await openSpeculationStore(transporter, "run");
  assert.deepEqual(third.initial, { completed: true });
  await third.release();
  await assert.rejects(openSpeculationStore(transporter, " "), /empty/);
});
