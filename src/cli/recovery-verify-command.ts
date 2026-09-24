import { verifyRecoveryTransfer } from "../application/recovery-verification.ts";
import { invariant } from "../domain/errors.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryVerifyCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  invariant(
    positionals.length === 2 && !!values.directory,
    "Usage: outpost recovery verify --directory TRANSFER_PATH [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      ["directory", "json"].includes(key),
      `Unsupported recovery verify option: --${key}`,
    );
  const report = await verifyRecoveryTransfer(values.directory);
  if (values.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(
      `Outpost recovery structure verification — ${JSON.stringify(report.directory)}\n`,
    );
    for (const check of report.checks)
      process.stdout.write(
        `[${check.status.toUpperCase()}] ${check.code}: ${JSON.stringify(check.path)}\n`,
      );
    process.stdout.write(
      `${report.complete ? "Expected transfer structure is present." : "Transfer structure is incomplete or unverifiable."}\n`,
    );
    process.stdout.write(
      "Patch and bundle contents, commit availability, activity and restorability are unverified. No files were changed.\n",
    );
  }
  if (!report.complete) process.exitCode = 1;
}
