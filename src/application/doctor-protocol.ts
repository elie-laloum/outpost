import { isDeepStrictEqual } from "node:util";
import { doctorAgents } from "./doctor-agent.constants.ts";
import type { AgentProtocolReport } from "./doctor-protocol.types.ts";
import type { DiagnosticCheck, DoctorAgent } from "./doctor.types.ts";

export function diagnoseAgentProtocol(agent: DoctorAgent): AgentProtocolReport {
  const profile = doctorAgents[agent];
  const adapter = profile.harness().bind();
  const checks: DiagnosticCheck[] = profile.protocol.map((fixture) => {
    const events = fixture.lines.flatMap((line) => adapter.events(line));
    const passed = isDeepStrictEqual(events, fixture.expected);
    return {
      id: `protocol.fixture.${fixture.name}`,
      status: passed ? "pass" : "fail",
      message: passed
        ? "Bundled synthetic events decode to the expected structural observations. No installed CLI or model was invoked."
        : "Bundled synthetic events do not match the expected structural observations.",
    };
  });
  return {
    scope: "bundled-protocol-fixtures",
    agent,
    ...(profile.referenceVersion === undefined
      ? {}
      : { referenceVersion: profile.referenceVersion }),
    installedCli: "unverified",
    modelCompatibility: "unverified",
    checks,
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
