import { createHash, randomUUID } from "node:crypto";
import type { Transport } from "../domain/transport.types.ts";
import { TransportConflict } from "../domain/transport.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import { speculationStoreLimits } from "./speculation-store.constants.ts";
import type {
  SpeculationRecoveryOptions,
  SpeculationStoreSession,
} from "./speculation-store.types.ts";

function key(runId: string): string {
  if (!runId.trim()) throw new Error("Speculation runId must not be empty");
  return `speculations/${createHash("sha256").update(runId).digest("hex")}.json`;
}
function envelope(value: unknown) {
  if (value === undefined) return { owner: null, state: undefined };
  if (
    !value ||
    typeof value !== "object" ||
    !("owner" in value) ||
    (value.owner !== null && typeof value.owner !== "string")
  )
    throw new Error("Invalid speculation ownership envelope");
  return {
    owner: value.owner,
    state: "state" in value ? value.state : undefined,
  };
}
export async function openSpeculationStore(
  transporter: Transport,
  runId: string,
): Promise<SpeculationStoreSession> {
  const target = key(runId);
  const previous = await transporter.read(target, speculationStoreLimits);
  let data = envelope(jsonObject(previous));
  if (data.owner !== null)
    throw new Error(
      "Speculation is already owned; stop its coordinator and recover explicitly",
    );
  const owner = randomUUID();
  let revision = (
    await transporter.write(target, jsonBytes({ ...data, owner }), {
      ifRevision: previous?.revision ?? null,
    })
  ).revision;
  let writes = Promise.resolve();
  let closed = false;
  return {
    initial: data.state,
    save(state) {
      if (closed)
        return Promise.reject(new Error("Speculation session is closed"));
      const bytes = jsonBytes({ owner, state });
      if (bytes.byteLength > speculationStoreLimits.maxBytes)
        return Promise.reject(
          new Error("Speculation checkpoint exceeds 16 MiB"),
        );
      writes = writes.then(async () => {
        revision = (
          await transporter.write(target, bytes, { ifRevision: revision })
        ).revision;
        data = { owner, state };
      });
      return writes;
    },
    async release() {
      if (closed) return;
      closed = true;
      // Failed writes retain ownership until an operator explicitly recovers it.
      await writes;
      await transporter.write(target, jsonBytes({ ...data, owner: null }), {
        ifRevision: revision,
      });
    },
  };
}
export async function recoverSpeculation(
  options: SpeculationRecoveryOptions,
): Promise<void> {
  if (options.coordinatorStopped !== true)
    throw new Error(
      "Stop the previous speculation coordinator before recovery",
    );
  const target = key(options.runId);
  const current = await options.transporter.read(
    target,
    speculationStoreLimits,
  );
  if (!current || current.revision !== options.revision)
    throw new TransportConflict(target);
  const data = envelope(jsonObject(current));
  await options.transporter.write(target, jsonBytes({ ...data, owner: null }), {
    ifRevision: current.revision,
  });
}
