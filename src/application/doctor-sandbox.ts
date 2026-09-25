import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import { diagnoseAgentCli } from "./doctor-agent.ts";
import { diagnosticProbe } from "./diagnostic-probe.ts";
import { doctorDefaults } from "./doctor.constants.ts";
import type { DiagnosticCheck } from "./doctor.types.ts";
import { diagnoseTransfers } from "./doctor-transfers.ts";
import { sandboxDiagnosticDefaults } from "./doctor-sandbox.constants.ts";
import type {
  SandboxDiagnosticOptions,
  SandboxDiagnosticReport,
} from "./doctor-sandbox.types.ts";
import type { Sandbox } from "./outpost.types.ts";

export async function diagnoseSandbox(
  target: Sandbox | SandboxLease,
  options: SandboxDiagnosticOptions = {},
): Promise<SandboxDiagnosticReport> {
  if ("diagnose" in target) return target.diagnose(options);
  const deadlineMs = options.deadlineMs ?? doctorDefaults.deadlineMs;
  invariant(
    Number.isInteger(deadlineMs) &&
      deadlineMs > 0 &&
      deadlineMs <= sandboxDiagnosticDefaults.maximumDeadlineMs,
    "Diagnostic deadlineMs must be an integer from 1 to 60000",
  );
  options.signal?.throwIfAborted();
  const invoke: Executor = (command) => {
    options.signal?.throwIfAborted();
    return target.invoke({
      ...command,
      deadlineMs,
      retain: command.retain ?? doctorDefaults.retain,
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(deadlineMs)])
        : AbortSignal.timeout(deadlineMs),
    });
  };
  const checks: DiagnosticCheck[] = [];
  for (const executable of ["node", "git"]) {
    checks.push(
      await diagnosticProbe(
        {
          id: `sandbox.${executable}`,
          command: { executable, arguments: ["--version"] },
          readVersion: true,
          failureStatus: "fail",
          remedy: `Install ${executable} in this sandbox.`,
        },
        invoke,
      ),
    );
  }
  try {
    const result = await invoke({
      executable: "node",
      arguments: ["-e", sandboxDiagnosticDefaults.command],
    });
    const passed =
      result.status === 7 &&
      result.stdout === "outpost-stdout" &&
      result.stderr === "outpost-stderr";
    checks.push({
      id: "sandbox.command",
      status: passed ? "pass" : "fail",
      message: passed
        ? "Observed separate output streams and nonzero process exit status."
        : "Command output or exit status did not match the diagnostic sentinel.",
    });
  } catch {
    checks.push({
      id: "sandbox.command",
      status: "fail",
      message: "Bounded command probe failed or was interrupted.",
    });
  }
  checks.push(
    await diagnosticProbe(
      {
        id: "sandbox.home",
        command: {
          executable: "node",
          arguments: ["-e", sandboxDiagnosticDefaults.home, target.home],
        },
        failureStatus: "fail",
        remedy: "Check the lease home directory and its permissions.",
      },
      invoke,
    ),
  );
  if (options.agent) {
    const version = await diagnosticProbe(
      {
        id: "agent.sandbox",
        command: { executable: options.agent, arguments: ["--version"] },
        readVersion: true,
        referenceVersion: agentVersions[options.agent],
        failureStatus: "fail",
        remedy: "Install the agent explicitly; diagnostics never bootstrap it.",
      },
      invoke,
    );
    checks.push(version);
    if (version.status !== "fail")
      checks.push(...(await diagnoseAgentCli(options.agent, invoke)));
  }
  if (options.transfers === true)
    checks.push(
      ...(await diagnoseTransfers(
        target,
        { deadlineMs, ...(options.signal ? { signal: options.signal } : {}) },
        invoke,
      )),
    );
  checks.push({
    id: "model",
    status: "skipped",
    message:
      "Authentication, model access and installed agent protocol compatibility are unverified. No model request was made.",
  });
  const observed = (id: string) => {
    const check = checks.find((check) => check.id === id);
    if (!check) return "unverified" as const;
    return check.status === "pass" ? ("pass" as const) : ("fail" as const);
  };
  return {
    scope: "owned-sandbox",
    ownership: "caller",
    ...(options.sandboxProvider
      ? {
          sandboxProvider: {
            name: options.sandboxProvider.name,
            placement: options.sandboxProvider.placement,
          },
        }
      : {}),
    capabilities: [
      {
        id: "command",
        advertised: true,
        observed: observed("sandbox.command"),
      },
      {
        id: "transfers",
        advertised: true,
        observed: observed("sandbox.transfers"),
      },
      {
        id: "batchTransfers",
        advertised: target.fileTransfers !== undefined,
        observed: "unverified",
      },
      {
        id: "interactiveTerminal",
        advertised: "unknown",
        observed: "unverified",
      },
    ],
    checks,
    modelCompatibility: "unverified",
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
