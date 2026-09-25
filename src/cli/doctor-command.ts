import {
  doctorDefaults,
  providerDiagnostics,
} from "../application/doctor.constants.ts";
import { diagnose } from "../application/doctor.ts";
import type { DoctorProvider } from "../application/doctor.types.ts";
import { invariant } from "../domain/errors.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import type { CliInvocation } from "./main.types.ts";

function isProvider(value: string): value is DoctorProvider {
  return Object.hasOwn(providerDiagnostics, value);
}
export async function doctorCommand(
  { values, positionals }: CliInvocation,
  execute?: Executor,
  write: (text: string) => void = (text) => {
    process.stdout.write(text);
  },
): Promise<void> {
  invariant(
    positionals.length === 1,
    "Usage: outpost doctor [--sandbox-provider NAME] [--agent NAME] [--image NAME] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      ["sandboxProvider", "agent", "image", "json"].includes(key),
      `Unsupported doctor option: --${key}`,
    );
  const sandboxProvider =
    values.sandboxProvider ?? doctorDefaults.sandboxProvider;
  const agent = values.agent ?? doctorDefaults.agent;
  invariant(
    isProvider(sandboxProvider),
    "Unknown provider. Choose docker, podman, local, vercel or daytona.",
  );
  invariant(
    agent === "codex" || agent === "claude" || agent === "gemini",
    "Unknown agent. Choose codex, claude or gemini.",
  );
  const report = await diagnose(
    {
      sandboxProvider,
      agent,
      ...(values.image !== undefined ? { image: values.image } : {}),
    },
    execute,
  );
  if (values.json) write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    write(
      `Outpost doctor — ${report.scope === "host" ? "host checks" : "host and image checks"} (${sandboxProvider}, ${agent})\n`,
    );
    write(
      `Provider contract: ${report.placement}; interactive terminal: ${report.interactiveTerminal ? "supported" : "unsupported"}. Workflow execution is not tested.\n`,
    );
    if (report.image) write(`Image: ${report.image}\n`);
    for (const check of report.checks)
      write(
        `[${check.status.toUpperCase()}] ${check.id}${check.version ? ` ${check.version}` : ""}${check.referenceVersion ? ` (pinned: ${check.referenceVersion})` : ""}: ${check.message}\n`,
      );
    write(
      report.hasFailures
        ? "Diagnostic checks found failures.\n"
        : "No blocking check failed; warnings and skipped checks still need review.\n",
    );
  }
  if (report.hasFailures) process.exitCode = 1;
}
