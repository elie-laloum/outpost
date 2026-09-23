import { invariant } from "../domain/errors.ts";
import type { OperationGate } from "./sandbox-session.types.ts";

export function operationGate(): OperationGate {
  let pending: Promise<unknown> | undefined;
  let closed = false;
  return {
    run(action) {
      invariant(!closed, "Sandbox is closed");
      invariant(
        !pending,
        "Sandbox already has an active operation; use another sandbox for parallel work",
      );
      const current = Promise.resolve().then(action);
      pending = current;
      const finished = () => {
        pending = undefined;
      };
      void current.then(finished, finished);
      return current;
    },
    async close() {
      closed = true;
      await pending?.catch(() => undefined);
    },
  };
}
