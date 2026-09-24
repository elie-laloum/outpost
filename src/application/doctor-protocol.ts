import { isDeepStrictEqual } from "node:util";
import { claude } from "../adapters/agents/claude-adapter.ts";
import { codex } from "../adapters/agents/codex-adapter.ts";
import { gemini } from "../adapters/agents/gemini-adapter.ts";
import { protocolFixtures } from "../adapters/agents/protocol-fixtures.constants.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import type { AgentProtocolReport } from "./doctor-protocol.types.ts";
import type { DiagnosticCheck, DoctorAgent } from "./doctor.types.ts";

export function diagnoseAgentProtocol(agent: DoctorAgent): AgentProtocolReport {
  const adapter = { claude, codex, gemini }[agent]();
  const checks: DiagnosticCheck[] = protocolFixtures[agent].map((fixture) => {
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
    referenceVersion: agentVersions[agent],
    installedCli: "unverified",
    modelCompatibility: "unverified",
    checks,
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
