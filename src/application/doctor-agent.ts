import { stripVTControlCharacters } from "node:util";
import type { Executor } from "../infrastructure/process.types.ts";
import { diagnosticProbe } from "./diagnostic-probe.ts";
import {
  agentDiagnosticDefaults,
  agentDiagnosticPlans,
} from "./doctor-agent.constants.ts";
import type { DiagnosticCheck, DoctorAgent } from "./doctor.types.ts";

export async function diagnoseAgentCli(
  agent: DoctorAgent,
  execute: Executor,
): Promise<readonly DiagnosticCheck[]> {
  const checks: DiagnosticCheck[] = [];
  for (const plan of agentDiagnosticPlans[agent]()) {
    let help = "";
    const check = await diagnosticProbe(
      {
        id: `agent.cli.${plan.mode}`,
        command: { ...plan.command, retain: agentDiagnosticDefaults.retain },
        failureStatus: "fail",
        remedy:
          "The default Outpost invocation with --help failed. Check the agent CLI in this image and rebuild it if needed.",
      },
      async (command) => {
        const result = await execute(command);
        help = stripVTControlCharacters(`${result.stdout}\n${result.stderr}`);
        return result;
      },
    );
    if (check.status !== "pass") {
      checks.push(check);
      continue;
    }
    const usage = help
      .split(/\r?\n/)
      .some((line) => line.trim().startsWith(`Usage: ${plan.usage} [`));
    if (!usage) {
      checks.push({
        id: check.id,
        status: "warn",
        message:
          "Command exited successfully but the expected help could not be identified; CLI support is unverified.",
      });
      continue;
    }
    const declared = new Set(
      [
        ...help.matchAll(/^\s*(?:-[A-Za-z0-9?],?\s+)?(--[A-Za-z][\w-]*)\b/gm),
      ].map((match) => match[1]),
    );
    const missing = plan.options.filter((option) => !declared.has(option));
    if (missing.length) {
      checks.push({
        id: check.id,
        status: "fail",
        message: `Help does not declare required options: ${missing.join(", ")}. Rebuild the image with a CLI supporting Outpost's default invocation.`,
      });
      continue;
    }
    checks.push({
      id: check.id,
      status: "pass",
      message:
        "Help identifies the command and declares the options used by Outpost's default invocation. Conversation execution and event decoding are not tested.",
    });
  }
  return checks;
}
