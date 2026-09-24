import { recoveryRetentionLimits } from "../application/recovery-retention.constants.ts";
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "../application/recovery-retention.ts";
import { retentionPolicy } from "../application/recovery-retention-policy.ts";
import { invariant } from "../domain/errors.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";
import { resolve } from "node:path";
import type { CliInvocation } from "./main.types.ts";

export async function recoveryPruneCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  invariant(
    positionals.length === 2 && !!values.policy,
    "Usage: outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      ["policy", "repository", "apply", "json"].includes(key),
      `Unsupported recovery prune option: --${key}`,
    );
  const policy: unknown = JSON.parse(
    (
      await readInspectionFile(
        resolve(values.policy),
        recoveryRetentionLimits.maxPolicyBytes,
      )
    ).toString("utf8"),
  );
  retentionPolicy(policy);
  const plan = await planRecoveryRetention({
    policy,
    ...(values.repository ? { repository: values.repository } : {}),
  });
  const result = values.apply ? await pruneRecoveryRetention(plan) : undefined;
  const after = result?.after ?? plan;
  if (values.json)
    process.stdout.write(
      `${JSON.stringify({ dryRun: !values.apply, plan, ...(result ? { result } : {}) }, null, 2)}\n`,
    );
  else {
    process.stdout.write(
      `Outpost retention ${values.apply ? "apply" : "dry run"} — ${JSON.stringify(plan.repository)}\n`,
    );
    for (const entry of plan.entries)
      process.stdout.write(
        `${entry.eligible ? "CANDIDATE" : "RETAIN"} ${JSON.stringify(entry.path)} | ${entry.reason} | ${entry.bytes} bytes\n`,
      );
    for (const path of result?.removed ?? [])
      process.stdout.write(`REMOVED ${JSON.stringify(path)}\n`);
    for (const entry of result?.retained ?? [])
      process.stdout.write(
        `RETAIN ${JSON.stringify(entry.path)} | ${entry.reason}\n`,
      );
    process.stdout.write(
      `Observed ${after.usageBytes} logical bytes; projected ${after.projectedBytes}; projected quota ${after.quota}. Branches and recovery artifacts are retained.\n`,
    );
  }
  if (!after.complete || after.quota !== "within" || result?.retained.length)
    process.exitCode = 1;
}
