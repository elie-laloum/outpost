import { inspectRecovery } from "../application/recovery-inspection.ts";
import { invariant, positive } from "../domain/errors.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  invariant(
    positionals.length === 2 && positionals[1] === "inspect",
    "Usage: outpost recovery inspect [--repository PATH] [--max-entries NUMBER] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      ["repository", "max-entries", "json"].includes(key),
      `Unsupported recovery option: --${key}`,
    );
  const maxEntries =
    values["max-entries"] === undefined
      ? undefined
      : positive(Number(values["max-entries"]), "max-entries");
  const report = await inspectRecovery({
    ...(values.repository !== undefined
      ? { repository: values.repository }
      : {}),
    ...(maxEntries !== undefined ? { maxEntries } : {}),
  });
  if (values.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(
      `Outpost recovery inspection — ${JSON.stringify(report.repository)}\n`,
    );
    for (const category of report.categories) {
      process.stdout.write(
        `${category.name}: ${category.entries.length} listed entries\n`,
      );
      for (const entry of category.entries)
        process.stdout.write(
          `  ${JSON.stringify(entry.name)} | ${entry.kind} | ${entry.bytes} bytes | ${entry.files} files | ${entry.symlinks} symlinks | ${entry.modifiedAt ?? "unknown time"} | ${entry.complete ? "complete" : "partial"}\n`,
        );
    }
    for (const issue of report.issues)
      process.stdout.write(
        `[PARTIAL] ${issue.code}: ${JSON.stringify(issue.path)}\n`,
      );
    process.stdout.write(
      `Total observed: ${report.usage.bytes} bytes in ${report.usage.files} files; ${report.scannedEntries}/${report.maxEntries} entries scanned.\n`,
    );
    process.stdout.write(
      `${report.complete ? "Inventory complete." : "Inventory incomplete; totals are partial."} File sizes are logical bytes; symlink targets are excluded.\n`,
    );
    process.stdout.write(
      "Activity and recovery integrity are unverified. No files were read for content or removed.\n",
    );
  }
  if (!report.complete) process.exitCode = 1;
}
