import { doctorAgents } from "../application/doctor-agent.constants.ts";
import {
  doctorDefaults,
  providerDiagnostics,
} from "../application/doctor.constants.ts";
import { diagnose } from "../application/doctor.ts";
import type {
  DoctorAgent,
  DoctorProvider,
} from "../application/doctor.types.ts";
import { invariant } from "../domain/errors.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import type { CliInvocation } from "./main.types.ts";
import { officialImage } from "./image-recipes.ts";
import { publishedReference } from "./image.ts";
import { packageVersion } from "./package-version.ts";

function isProvider(value: string): value is DoctorProvider {
  return Object.hasOwn(providerDiagnostics, value);
}
function isAgent(value: string): value is DoctorAgent {
  return Object.hasOwn(doctorAgents, value);
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
    "Usage: outpost doctor [--provider NAME] [--agent NAME] [--image NAME] [--timeout MS] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      [
        "provider",
        "agent",
        "image",
        "workspace-kind",
        "timeout",
        "json",
      ].includes(key),
      `Unsupported doctor option: --${key}`,
    );
  const sandboxProvider = values.provider ?? doctorDefaults.sandboxProvider;
  const official =
    values.image === undefined ? undefined : officialImage(values.image);
  const image = official
    ? publishedReference(official, packageVersion()).reference
    : values.image;
  const agent = values.agent ?? official?.agent?.name ?? doctorDefaults.agent;
  const workspaceKind = values["workspace-kind"] ?? "git";
  invariant(
    workspaceKind === "git" ||
      workspaceKind === "directory" ||
      workspaceKind === "ephemeral",
    "Unsupported workspace kind",
  );
  invariant(
    isProvider(sandboxProvider),
    "Unknown provider. Choose docker, podman, local, vercel or daytona.",
  );
  invariant(
    isAgent(agent),
    `Unknown agent. Choose ${Object.keys(doctorAgents).join(", ")}.`,
  );
  const report = await diagnose(
    {
      sandboxProvider,
      agent,
      workspaceKind,
      ...(values.timeout !== undefined
        ? { deadlineMs: Number(values.timeout) }
        : {}),
      ...(image !== undefined ? { image } : {}),
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
  if (report.hasFailures && !process.exitCode) process.exitCode = 1;
}
