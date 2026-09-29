import { builtInAgentRecord } from "../adapters/agents/catalog.ts";
import type { DoctorAgentProfile } from "./doctor.types.ts";

export const doctorAgents = builtInAgentRecord((agent): DoctorAgentProfile => ({
  executable: agent.executable,
  referenceVersion: agent.version,
  ...(agent.doctor.variables === undefined
    ? {}
    : { variables: agent.doctor.variables }),
  diagnostics: agent.doctor.diagnostics,
  harness: () => agent.harness(),
  protocol: agent.protocol,
}));
export const agentDiagnosticDefaults = Object.freeze({ retain: 65_536 });
