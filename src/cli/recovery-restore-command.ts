import {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "../application/recovery-restore.ts";
import { invariant, positive } from "../domain/errors.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryRestoreCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  invariant(
    positionals.length === 2 &&
      !!values.directory &&
      !!values.repository &&
      !!values.destination &&
      (values.side === "previous" || values.side === "incoming"),
    "Usage: outpost recovery restore --directory TRANSFER_PATH --repository PATH --destination NEW_PATH --side previous|incoming [--max-bytes NUMBER] [--apply] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      [
        "directory",
        "repository",
        "destination",
        "side",
        "max-bytes",
        "apply",
        "json",
      ].includes(key),
      `Unsupported recovery restore option: --${key}`,
    );
  const plan = await planRecoveryRestore({
    directory: values.directory,
    repository: values.repository,
    destination: values.destination,
    side: values.side,
    ...(values["max-bytes"] === undefined
      ? {}
      : { maxBytes: positive(Number(values["max-bytes"]), "max-bytes") }),
  });
  const result = values.apply ? await restoreRecoveryTransfer(plan) : plan;
  if (values.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else
    process.stdout.write(
      `${values.apply ? "Restored" : "Planned"} ${plan.side} recovery at ${JSON.stringify(plan.destination)}\nCommit: ${plan.commit}; staging: ${plan.staging}. Source retained.\n${values.apply ? "Review the detached checkout before explicitly integrating it.\n" : "No destination created. Use --apply to restore into this new directory.\n"}`,
    );
}
