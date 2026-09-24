import { verifyRecoveryTransfer } from "../application/recovery-verification.ts";
import { invariant, positive } from "../domain/errors.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryVerifyCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  invariant(
    positionals.length === 2 && !!values.directory,
    "Usage: outpost recovery verify --directory TRANSFER_PATH [--checksums] [--max-bytes NUMBER] [--restorability --repository PATH] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      [
        "directory",
        "checksums",
        "max-bytes",
        "json",
        "restorability",
        "repository",
      ].includes(key),
      `Unsupported recovery verify option: --${key}`,
    );
  invariant(
    values["max-bytes"] === undefined || values.checksums,
    "--max-bytes requires --checksums",
  );
  invariant(
    !values.repository || values.restorability,
    "--repository requires --restorability",
  );
  const report = await verifyRecoveryTransfer(values.directory, {
    ...(values.restorability ? { restorability: true } : {}),
    ...(values.repository ? { repository: values.repository } : {}),
    ...(values.checksums ? { checksums: true } : {}),
    ...(values["max-bytes"] !== undefined
      ? { maxBytes: positive(Number(values["max-bytes"]), "max-bytes") }
      : {}),
  });
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
      `${report.complete ? "Requested transfer checks passed." : "Transfer checks failed or are incomplete."}\n`,
    );
    if (values.restorability)
      process.stdout.write(
        "Restorability scope: commit objects, bundle validity and three transfer patches applied independently in a temporary clone. Payload restoration, original staging/worktree consistency, session patches, submodules and external dependencies are outside this scope. Target repository unchanged.\n",
      );
    if (values.checksums) {
      process.stdout.write(
        `Checksums: ${report.integrity}; ${report.checksums?.bytesChecked ?? 0} bytes checked.\n`,
      );
      process.stdout.write(
        "Checksums compare against an unsigned manifest. Activity and full restoration remain unverified. No files were changed.\n",
      );
    }
    if (!values.checksums && !values.restorability)
      process.stdout.write(
        "Patch and bundle contents, commit availability, activity and restorability are unverified. No files were changed.\n",
      );
  }
  if (!report.complete) process.exitCode = 1;
}
