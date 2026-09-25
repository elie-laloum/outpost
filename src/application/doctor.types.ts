import type { Command } from "../domain/command.types.ts";
export type DoctorProvider =
  "docker" | "podman" | "local" | "vercel" | "daytona";
export type DoctorAgent = "codex" | "claude" | "gemini";
export type DiagnosticStatus = "pass" | "warn" | "fail" | "skipped";
export interface DiagnosticCheck {
  readonly id: string;
  readonly status: DiagnosticStatus;
  readonly message: string;
  readonly version?: string;
  readonly referenceVersion?: string;
}
export interface DoctorOptions {
  readonly image?: string;
  readonly sandboxProvider: DoctorProvider;
  readonly agent: DoctorAgent;
}
export interface DoctorImageOptions {
  readonly sandboxProvider: "docker" | "podman";
  readonly agent: DoctorAgent;
  readonly image: string;
}
export interface DoctorReport {
  readonly sandboxProvider: DoctorProvider;
  readonly agent: DoctorAgent;
  readonly scope: "host" | "host-and-image";
  readonly image?: string;
  readonly placement: "mounted" | "host" | "remote";
  readonly interactiveTerminal: boolean;
  readonly checks: readonly DiagnosticCheck[];
  readonly hasFailures: boolean;
}
export interface DiagnosticProbe {
  readonly id: string;
  readonly command: Command;
  readonly failureStatus: "fail" | "warn";
  readonly remedy: string;
  readonly readVersion?: boolean;
  readonly referenceVersion?: string;
}
