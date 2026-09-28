import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { vercelSandboxProvider } from "../src/providers/vercel.ts";
import { daytonaSandboxProvider } from "../src/providers/daytona.ts";
import { OutpostError } from "../src/domain/errors.ts";
import { networkProbeScript } from "./fixtures/network-probe.constants.ts";
import {
  networkProbes,
  networkScenarios,
} from "./fixtures/network-live.constants.ts";
import { cloudCompatibilitySource } from "./fixtures/cloud-compatibility-source.ts";

if (process.env.OUTPOST_NETWORK_LIVE !== "1") {
  console.log(
    JSON.stringify({ status: "skipped", reason: "Set OUTPOST_NETWORK_LIVE=1" }),
  );
  process.exit(2);
}
const providerName = process.env.OUTPOST_NETWORK_PROVIDER;
if (providerName !== "vercel" && providerName !== "daytona")
  throw new Error("Select OUTPOST_NETWORK_PROVIDER=vercel or daytona");
const environment = process.env;
const required =
  providerName === "vercel"
    ? ["VERCEL_TOKEN", "VERCEL_TEAM_ID", "VERCEL_PROJECT_ID"]
    : ["DAYTONA_API_KEY"];
if (required.some((key) => !environment[key]))
  throw new Error("Missing cloud credentials");
const directory = await mkdtemp(join(tmpdir(), "outpost-network-"));
const baseline = new Map<string, boolean>();
const reports: Record<string, unknown>[] = [];
let failed = false,
  unavailable = false;
try {
  for (const scenario of networkScenarios) {
    if (providerName === "daytona" && scenario.name === "cidr-deny") continue;
    const egress =
      providerName === "daytona" &&
      scenario.name === "domains" &&
      scenario.egress?.mode === "allowlist"
        ? {
            ...scenario.egress,
            domains: [...(scenario.egress.domains ?? []), "npmjs.org"],
          }
        : scenario.egress;
    const options = egress ? { egress } : {};
    const provider =
      providerName === "vercel"
        ? vercelSandboxProvider({
            ...options,
            create: {
              token: environment.VERCEL_TOKEN!,
              teamId: environment.VERCEL_TEAM_ID!,
              projectId: environment.VERCEL_PROJECT_ID!,
              runtime: "node24",
              timeout: 180_000,
            },
          })
        : daytonaSandboxProvider({
            ...options,
            connection: { apiKey: environment.DAYTONA_API_KEY! },
            create: {
              language: "typescript",
              autoStopInterval: 3,
              autoDeleteInterval: 0,
            },
          });
    let lease;
    try {
      lease = await provider.acquire({
        repository: directory,
        directory,
        gitDirectories: [],
        variables: {},
        signal: AbortSignal.timeout(120_000),
      });
      for (const probe of networkProbes) {
        const result = await lease.invoke({
          executable: "node",
          arguments: ["-e", networkProbeScript, JSON.stringify(probe)],
          deadlineMs: 15_000,
        });
        const output: unknown = JSON.parse(result.stdout);
        if (
          result.status !== 0 ||
          !output ||
          typeof output !== "object" ||
          !("outcome" in output) ||
          !["reachable", "blocked", "invalid-redirect"].includes(
            String(output.outcome),
          )
        )
          throw new Error("Invalid probe result");
        const reachable = output.outcome === "reachable";
        if (scenario.name === "baseline") baseline.set(probe.name, reachable);
        const expected =
          scenario.name === "baseline" ||
          (scenario.name === "domains" &&
            (probe.allowed ||
              (providerName === "daytona" &&
                probe.name === "wildcard-apex"))) ||
          (scenario.name === "cidr-allow" && probe.name === "raw-ipv4") ||
          (scenario.name === "cidr-deny" && probe.name === "exact-domain");
        const measurable = baseline.get(probe.name) === true;
        let status = "unverified";
        if (measurable)
          status =
            reachable === expected && output.outcome !== "invalid-redirect"
              ? "pass"
              : "fail";
        if (status === "fail") failed = true;
        if (status === "unverified") unavailable = true;
        reports.push({
          scenario: scenario.name,
          probe: probe.name,
          status,
          outcome: output.outcome,
        });
      }
      const reuse = await lease.invoke({
        executable: "sh",
        arguments: ["-c", "exit 7"],
        deadlineMs: 10_000,
      });
      const status = reuse.status === 7 ? "pass" : "fail";
      if (status === "fail") failed = true;
      reports.push({
        scenario: scenario.name,
        probe: "reuse-exit-status",
        status,
      });
    } catch (error) {
      const confirmation =
        error instanceof OutpostError &&
        error.details.stage === "egress-confirmation";
      const creation =
        providerName === "daytona" &&
        scenario.egress !== undefined &&
        error instanceof Error &&
        error.message.startsWith(
          "Network access is restricted and cannot be overridden at the sandbox level.",
        );
      const capability = confirmation || creation;
      if (capability) unavailable = true;
      if (!capability) failed = true;
      let reason = "allocation-or-probe-failed";
      if (creation) reason = "egress-creation-rejected";
      if (confirmation) reason = "egress-confirmation-rejected";
      reports.push({
        scenario: scenario.name,
        status: capability ? "unavailable" : "fail",
        reason,
      });
    } finally {
      if (lease) {
        try {
          await lease.release();
          reports.push({
            scenario: scenario.name,
            probe: "cleanup",
            status: "pass",
          });
        } catch {
          failed = true;
          reports.push({
            scenario: scenario.name,
            probe: "cleanup",
            status: "fail",
          });
        }
      }
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
let status = unavailable ? "partial" : "pass";
let exitCode = unavailable ? 2 : 0;
if (failed) {
  status = "fail";
  exitCode = 1;
}
console.log(
  JSON.stringify(
    {
      provider: providerName,
      source: await cloudCompatibilitySource(
        fileURLToPath(new URL("../", import.meta.url)),
      ),
      recordedAt: new Date().toISOString(),
      status,
      reports,
    },
    null,
    2,
  ),
);
process.exitCode = exitCode;
