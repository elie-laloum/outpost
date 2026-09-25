import { invariant } from "../domain/errors.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import { diagnoseImage } from "./doctor-image.ts";
import { diagnosticProbe } from "./diagnostic-probe.ts";
import { doctorDefaults, providerDiagnostics } from "./doctor.constants.ts";
import type {
  DiagnosticCheck,
  DoctorOptions,
  DoctorReport,
} from "./doctor.types.ts";

export async function diagnose(
  options: DoctorOptions,
  execute: Executor = executeProcess,
): Promise<DoctorReport> {
  const { sandboxProvider, agent, image } = options;
  if (image !== undefined) {
    invariant(
      sandboxProvider === "docker" || sandboxProvider === "podman",
      "--image requires docker or podman.",
    );
    invariant(
      image.length > 0 &&
        !image.startsWith("-") &&
        !/[\x00-\x20\x7f]/.test(image),
      "Invalid diagnostic image name.",
    );
  }
  const capabilities = providerDiagnostics[sandboxProvider];
  const checks: DiagnosticCheck[] = [
    {
      id: "host.node",
      status:
        Number(process.versions.node.split(".")[0]) >=
        doctorDefaults.minimumNodeMajor
          ? "pass"
          : "fail",
      version: process.versions.node,
      message: `Outpost requires Node.js ${doctorDefaults.minimumNodeMajor}+.`,
    },
  ];
  checks.push(
    await diagnosticProbe(
      {
        id: "host.git",
        command: { executable: "git", arguments: ["--version"] },
        failureStatus: "fail",
        remedy: "Install Git and make it available on PATH.",
        readVersion: true,
      },
      execute,
    ),
  );
  if (capabilities.placement === "mounted") {
    const engine = await diagnosticProbe(
      {
        id: "provider.cli",
        command: { executable: sandboxProvider, arguments: ["--version"] },
        failureStatus: "fail",
        remedy: `Install ${sandboxProvider} and make it available on PATH.`,
        readVersion: true,
      },
      execute,
    );
    checks.push(engine);
    if (engine.status === "pass")
      checks.push(
        await diagnosticProbe(
          {
            id: "provider.connection",
            command: {
              executable: sandboxProvider,
              arguments: ["info"],
            },
            failureStatus: "fail",
            remedy: `Check ${sandboxProvider} is running and accessible to this user; on macOS, start its virtual machine.`,
          },
          execute,
        ),
      );
    checks.push(
      await diagnosticProbe(
        {
          id: "host.tar",
          command: { executable: "tar", arguments: ["--version"] },
          failureStatus: "fail",
          remedy: "Install GNU tar or bsdtar for container transfers.",
        },
        execute,
      ),
    );
  }
  if (capabilities.placement === "remote")
    checks.push({
      id: "provider.cloud",
      status: "skipped",
      message:
        "Cloud SDK, credentials, account access and allocation are not checked.",
    });
  checks.push(
    await diagnosticProbe(
      {
        id: "agent.host",
        command: { executable: agent, arguments: ["--version"] },
        failureStatus: "warn",
        remedy:
          "Host CLI is unavailable or unverified. A sandbox may have its own CLI; dispatch can bootstrap a missing agent.",
        readVersion: true,
        referenceVersion: agentVersions[agent],
      },
      execute,
    ),
  );
  if (
    image !== undefined &&
    (sandboxProvider === "docker" || sandboxProvider === "podman")
  ) {
    const connected = checks.some(
      (check) => check.id === "provider.connection" && check.status === "pass",
    );
    if (connected)
      checks.push(
        ...(await diagnoseImage({ sandboxProvider, agent, image }, execute)),
      );
    else
      checks.push({
        id: "image.runtime",
        status: "skipped",
        message: "Image checks require a reachable container engine.",
      });
  }
  if (capabilities.placement !== "host" && image === undefined)
    checks.push({
      id: "agent.sandbox",
      status: "skipped",
      message:
        "Agent version inside the sandbox is not checked; the host version does not describe the sandbox.",
    });
  checks.push({
    id: "execution",
    status: "skipped",
    message:
      image === undefined
        ? "Images, mounts, repository state, authentication and model access are not tested. No sandbox is allocated."
        : "Workflow mounts, repository state, authentication and model access are not tested. Image checks use a separate temporary sandbox.",
  });
  return {
    ...options,
    scope: image === undefined ? "host" : "host-and-image",
    ...capabilities,
    checks,
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
