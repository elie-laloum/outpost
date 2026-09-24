import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SandboxLease, TransferOptions } from "../domain/sandbox.types.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { doctorDefaults } from "./doctor.constants.ts";
import type { DiagnosticCheck } from "./doctor.types.ts";
import { transferDiagnosticRecipe as recipe } from "./doctor-transfers.constants.ts";

export async function diagnoseTransfers(
  lease: SandboxLease,
  options: TransferOptions,
  invoke: Executor,
): Promise<DiagnosticCheck[]> {
  const checks: DiagnosticCheck[] = [];
  const directory = await mkdtemp(join(tmpdir(), "outpost-probe-"));
  const remote = `${lease.root.replace(/[\\/]$/, "")}/.outpost-probe-${randomUUID()}`;
  const source = join(directory, "source");
  let cleanupNeeded = false;
  try {
    cleanupNeeded = true;
    const result = await invoke({
      executable: "node",
      arguments: ["-e", recipe.create, remote],
    });
    if (result.status !== 0) {
      cleanupNeeded = false;
      throw new Error("create");
    }
    const payload = Buffer.from(recipe.base64, "base64");
    await writeFile(source, payload, { mode: 0o600 });
    const bounded = () => ({
      ...options,
      signal: options.signal
        ? AbortSignal.any([
            options.signal,
            AbortSignal.timeout(
              options.deadlineMs ?? doctorDefaults.deadlineMs,
            ),
          ])
        : AbortSignal.timeout(options.deadlineMs ?? doctorDefaults.deadlineMs),
    });
    await lease.upload(source, `${remote}/payload`, bounded());
    const verified = await invoke({
      executable: "node",
      arguments: ["-e", recipe.verify, `${remote}/payload`, recipe.base64],
    });
    if (verified.status !== 0) throw new Error("verify");
    const destination = join(directory, "download");
    await lease.download(`${remote}/payload`, destination, bounded());
    if (!(await readFile(destination)).equals(payload))
      throw new Error("download");
    checks.push({
      id: "sandbox.transfers",
      status: "pass",
      message:
        "Binary upload verified by a sandbox process; downloaded bytes match. Symlinks, permissions, directories and batch transfers remain unverified.",
    });
  } catch {
    checks.push({
      id: "sandbox.transfers",
      status: "fail",
      message: "Bounded binary transfer probe failed or was interrupted.",
    });
  } finally {
    if (cleanupNeeded) {
      try {
        const result = await lease.invoke({
          executable: "node",
          arguments: ["-e", recipe.cleanup, remote],
          deadlineMs: options.deadlineMs ?? doctorDefaults.deadlineMs,
          signal: AbortSignal.timeout(
            options.deadlineMs ?? doctorDefaults.deadlineMs,
          ),
          retain: doctorDefaults.retain,
        });
        if (result.status !== 0) throw new Error("cleanup");
        checks.push({
          id: "sandbox.transfers.cleanup",
          status: "pass",
          message: "Temporary sandbox probe directory removed.",
        });
      } catch {
        checks.push({
          id: "sandbox.transfers.cleanup",
          status: "fail",
          message: `Temporary probe cleanup could not be confirmed; inspect ${remote}. The caller still owns the sandbox.`,
        });
      }
    }
    await rm(directory, { recursive: true, force: true });
  }
  return checks;
}
