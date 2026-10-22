import { open } from "node:fs/promises";
import type { Observation } from "../domain/observation.types.ts";
import type { ObservationFile } from "./observation-file.types.ts";

/** Opens an NDJSON event log readable only by the current user. */
export async function openObservationFile(
  path: string,
): Promise<ObservationFile> {
  const handle = await open(path, "a", 0o600);
  let pending = Promise.resolve();
  const write = (observation: Observation) =>
    (pending = pending.then(() =>
      handle.appendFile(`${JSON.stringify(observation)}\n`),
    ));
  async function close() {
    try {
      await pending;
    } finally {
      await handle.close();
    }
  }
  return {
    observe: write,
    flush: () => pending,
    close,
    [Symbol.asyncDispose]: close,
  };
}
