import { invariant } from "../domain/errors.ts";
import {
  inspectLocalLock,
  recoverLocalLock,
} from "../infrastructure/git/lock-recovery.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryUnlockCommand({
  values,
}: CliInvocation): Promise<void> {
  invariant(
    values.directory && values.lock,
    "Lock recovery requires --directory .outpost/locks and --lock NAME",
  );
  if (values.apply) {
    invariant(
      values.revision && values["processes-stopped"],
      "Lock recovery requires the inspected --revision and --processes-stopped",
    );
    await recoverLocalLock(values.directory, values.lock, {
      revision: values.revision,
      processesStopped: true,
    });
    process.stdout.write(
      values.json ? '{"recovered":true}\n' : "Lock recovered\n",
    );
    return;
  }
  const snapshot = await inspectLocalLock(values.directory, values.lock);
  process.stdout.write(
    values.json
      ? `${JSON.stringify(snapshot)}\n`
      : `Lock: ${snapshot.path}\nRevision: ${snapshot.revision}\nOwnership: ${snapshot.ownership?.status ?? "unknown"}\nStop all users of this lock directory before applying recovery.\n`,
  );
}
