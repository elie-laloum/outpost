import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { diagnosticContainer } from "../providers/diagnostic-container.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import { diagnoseAgentCli } from "./doctor-agent.ts";
import { diagnosticProbe } from "./diagnostic-probe.ts";
import { doctorDefaults } from "./doctor.constants.ts";
import type { DiagnosticCheck, DoctorImageOptions } from "./doctor.types.ts";

export async function diagnoseImage(
  options: DoctorImageOptions,
  execute: Executor = executeProcess,
): Promise<readonly DiagnosticCheck[]> {
  const stop = new AbortController();
  const pending = inspectImage(options, execute, stop.signal);
  const unregister = registerCleanup(async () => {
    stop.abort(new OutpostError("aborted", "Image diagnostics interrupted"));
    await pending;
  });
  try {
    return await pending;
  } finally {
    unregister();
  }
}

async function inspectImage(
  { provider, agent, image }: DoctorImageOptions,
  execute: Executor,
  signal: AbortSignal,
): Promise<readonly DiagnosticCheck[]> {
  const directory = await mkdtemp(join(tmpdir(), "outpost-doctor-"));
  const checks: DiagnosticCheck[] = [];
  let lease: SandboxLease | undefined;
  let retained = false;
  let container: string | undefined;
  const tracked: Executor = (command) => {
    if (command.arguments?.[0] === "create") {
      const index = command.arguments.indexOf("--name");
      container = command.arguments[index + 1];
    }
    return execute(command);
  };
  try {
    lease = await diagnosticContainer(
      provider,
      image,
      doctorDefaults.deadlineMs,
      tracked,
    ).acquire({
      repository: directory,
      directory,
      gitDirectories: [],
      variables: {},
      signal,
    });
    checks.push({
      id: "image.runtime",
      status: "pass",
      message:
        "Temporary sandbox started with network disabled and an empty workspace.",
    });
    const sandbox = lease;
    const invoke: Executor = (command) =>
      sandbox.invoke({ ...command, signal });
    for (const executable of ["node", "git"]) {
      checks.push(
        await diagnosticProbe(
          {
            id: `image.${executable}`,
            command: { executable, arguments: ["--version"] },
            failureStatus: "fail",
            readVersion: true,
            remedy: `Install ${executable} in the image and rebuild it.`,
          },
          invoke,
        ),
      );
    }
    checks.push(
      await diagnosticProbe(
        {
          id: "image.home",
          command: {
            executable: "sh",
            arguments: ["-c", 'test -d "$HOME" && test -w "$HOME"'],
          },
          failureStatus: "fail",
          remedy:
            "Check the image user and permissions of the private agent home.",
        },
        invoke,
      ),
    );
    const agentVersion = await diagnosticProbe(
      {
        id: "agent.sandbox",
        command: { executable: agent, arguments: ["--version"] },
        failureStatus: "fail",
        readVersion: true,
        referenceVersion: agentVersions[agent],
        remedy: `Install ${agent} in the image and rebuild it. This check does not bootstrap agents.`,
      },
      invoke,
    );
    checks.push(agentVersion);
    if (agentVersion.status === "fail")
      checks.push({
        id: "agent.cli",
        status: "skipped",
        message: "CLI help checks require a successful agent version probe.",
      });
    else checks.push(...(await diagnoseAgentCli(agent, invoke)));
  } catch (error) {
    retained = error instanceof AggregateError;
    checks.push({
      id: "image.runtime",
      status: "fail",
      message:
        "Image diagnostics could not start. Check that the image exists locally, its UID matches the host, and sh, sleep, setsid, kill, tar and cp are installed. No image is downloaded.",
    });
  } finally {
    if (lease) {
      try {
        await lease.release();
        checks.push({
          id: "image.cleanup",
          status: "pass",
          message: "Diagnostic container removed.",
        });
      } catch {
        retained = true;
      }
    }
    if (retained)
      checks.push({
        id: "image.cleanup",
        status: "fail",
        message: `Cleanup could not be confirmed. Inspect container ${container ?? "creation state"} with ${provider}; temporary workspace retained at ${directory}.`,
      });
    if (!retained) {
      try {
        await rm(directory, { recursive: true, force: true });
      } catch {
        checks.push({
          id: "image.workspace",
          status: "fail",
          message: `Could not remove temporary workspace ${directory}.`,
        });
      }
    }
  }
  return checks;
}
