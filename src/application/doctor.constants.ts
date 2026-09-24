import type { DoctorProvider, DoctorReport } from "./doctor.types.ts";
export const doctorDefaults = Object.freeze({
  provider: "docker",
  agent: "codex",
  deadlineMs: 5_000,
  retain: 4_096,
  minimumNodeMajor: 24,
} as const);
export const providerDiagnostics: Readonly<
  Record<
    DoctorProvider,
    Pick<DoctorReport, "placement" | "interactiveTerminal">
  >
> = {
  docker: { placement: "mounted", interactiveTerminal: true },
  podman: { placement: "mounted", interactiveTerminal: true },
  local: { placement: "host", interactiveTerminal: true },
  vercel: { placement: "remote", interactiveTerminal: false },
  daytona: { placement: "remote", interactiveTerminal: true },
};
