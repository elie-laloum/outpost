import { OutpostError } from "../domain/errors.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { doctorDefaults } from "./doctor.constants.ts";
import type { DiagnosticCheck, DiagnosticProbe } from "./doctor.types.ts";

export async function diagnosticProbe(
  probe: DiagnosticProbe,
  execute: Executor = executeProcess,
): Promise<DiagnosticCheck> {
  const failure = (reason: string): DiagnosticCheck => ({
    id: probe.id,
    status: probe.failureStatus,
    message: `${reason}. ${probe.remedy}`,
  });
  try {
    const result = await execute({
      ...probe.command,
      deadlineMs: doctorDefaults.deadlineMs,
      retain: probe.command.retain ?? doctorDefaults.retain,
    });
    if (result.status !== 0)
      return failure(`Exited with status ${result.status}`);
    if (!probe.readVersion)
      return {
        id: probe.id,
        status: "pass",
        message: "Check succeeded.",
      };
    const version = /\bv?(\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)\b/.exec(
      result.stdout || result.stderr,
    )?.[1];
    if (!version) return failure("Version could not be identified");
    if (probe.referenceVersion)
      return {
        id: probe.id,
        status: version === probe.referenceVersion ? "pass" : "warn",
        version,
        referenceVersion: probe.referenceVersion,
        message:
          version === probe.referenceVersion
            ? "Matches the version pinned by Outpost; protocol and authentication are not tested."
            : "Differs from the version pinned by Outpost; compatibility is unverified.",
      };
    return {
      id: probe.id,
      status: "pass",
      version,
      message: "Version identified.",
    };
  } catch (error) {
    if (error instanceof OutpostError && error.code === "timeout")
      return failure(`Check timed out after ${doctorDefaults.deadlineMs} ms`);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    )
      return failure("Executable not found on PATH");
    return failure("Command could not be executed");
  }
}
