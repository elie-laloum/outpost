import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { interruptible } from "../../src/infrastructure/abort.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import {
  cloudNames,
  compatibilityLimits,
  requiredCredentials,
} from "./cloud-compatibility.constants.ts";
import type {
  CompatibilityCheck,
  CompatibilityOptions,
  CompatibilityReport,
} from "./cloud-compatibility.types.ts";
import { verifyCloudLease } from "./cloud-lease-contract.ts";
import { verifyCloudModels } from "./cloud-model-contract.ts";
import { verifyCloudAgents } from "./cloud-agent-contract.ts";

export async function runCloudCompatibility(
  options: CompatibilityOptions,
): Promise<readonly CompatibilityReport[]> {
  const reports: CompatibilityReport[] = [];
  const selected =
    options.environment.OUTPOST_CLOUD_PROVIDERS?.split(",") ?? [];
  for (const provider of cloudNames) {
    const checks: CompatibilityCheck[] = [];
    const missing = requiredCredentials[provider].some(
      (key) => !options.environment[key],
    );
    if (
      options.environment.OUTPOST_CLOUD_LIVE !== "1" ||
      !selected.includes(provider) ||
      missing
    ) {
      const reason = missing ? "credentials-unavailable" : "not-opted-in";
      reports.push({
        provider,
        status: "skipped",
        checks: [{ name: "allocation", status: "skipped", reason }],
      });
      continue;
    }
    const directory = await mkdtemp(
      join(tmpdir(), "outpost-cloud-compatibility-"),
    );
    const signal = AbortSignal.timeout(
      options.deadlineMs ?? compatibilityLimits.deadlineMs,
    );
    let lease: SandboxLease | undefined;
    let stage = "allocation";
    try {
      const acquiring = options.create(provider).acquire({
        repository: directory,
        directory,
        gitDirectories: [],
        variables: {},
        signal,
      });
      void acquiring
        .then(async (late) => {
          if (signal.aborted && !lease) await late.release();
        })
        .catch(() => undefined);
      lease = await interruptible(acquiring, signal);
      checks.push({ name: stage, status: "pass" });
      stage = "lease-contract";
      await interruptible(
        (options.verify ?? verifyCloudLease)(
          lease,
          directory,
          signal,
          (check) => checks.push(check),
        ),
        signal,
      );
      if (
        options.environment.OUTPOST_CLOUD_AGENTS === "1" ||
        options.environment.OUTPOST_CLOUD_MODELS === "1"
      ) {
        stage = "agent-cli-contract";
        await interruptible(
          verifyCloudAgents(lease, signal, (check) => checks.push(check)),
          signal,
        );
      } else
        checks.push({
          name: "agent-cli-contract",
          status: "skipped",
          reason: "not-opted-in",
        });
      if (options.environment.OUTPOST_CLOUD_MODELS === "1") {
        stage = "authenticated-model-turn";
        await interruptible(
          verifyCloudModels(lease, options.environment, signal, (check) =>
            checks.push(check),
          ),
          signal,
        );
      } else
        checks.push({
          name: "authenticated-model-turn",
          status: "skipped",
          reason: "not-opted-in",
        });
    } catch {
      checks.push({
        name: stage,
        status: "fail",
        reason: signal.aborted ? "deadline-exceeded" : "contract-failed",
      });
    } finally {
      if (lease) {
        try {
          await interruptible(
            (async () => {
              await lease.release();
              await lease.release();
            })(),
            AbortSignal.timeout(
              options.cleanupMs ?? compatibilityLimits.cleanupMs,
            ),
          );
          checks.push({ name: "cleanup", status: "pass" });
        } catch {
          checks.push({
            name: "cleanup",
            status: "fail",
            reason: "cleanup-unconfirmed",
          });
        }
      } else
        checks.push({
          name: "cleanup",
          status: "skipped",
          reason: "no-lease-returned",
        });
      await rm(directory, { recursive: true, force: true });
    }
    reports.push({
      provider,
      status: checks.some((check) => check.status === "fail") ? "fail" : "pass",
      checks,
    });
  }
  return reports;
}
