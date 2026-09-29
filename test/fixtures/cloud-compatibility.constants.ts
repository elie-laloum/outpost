import { builtInAgents } from "../../src/adapters/agents/catalog.ts";

export const cloudNames = ["vercel", "daytona"] as const;
export const compatibilityLimits = {
  deadlineMs: 240_000,
  cleanupMs: 30_000,
  commandMs: 30_000,
  cancelMs: 750,
  bytes: 4096,
} as const;
export const requiredCredentials = {
  vercel: ["VERCEL_TOKEN", "VERCEL_TEAM_ID", "VERCEL_PROJECT_ID"],
  daytona: ["DAYTONA_API_KEY"],
} as const;
export const agentPackages = builtInAgents.flatMap(
  ({ executable, install, doctor }) =>
    install.kind === "npm"
      ? [
          {
            executable,
            package: install.package,
            diagnostics: doctor.diagnostics,
          },
        ]
      : [],
);
