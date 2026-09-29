import assert from "node:assert/strict";
import { cloudCommandFailure } from "./cloud-failure.ts";
import { posix } from "node:path";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import type { CompatibilityCheck } from "./cloud-compatibility.types.ts";
import {
  agentPackages,
  compatibilityLimits,
} from "./cloud-compatibility.constants.ts";

export async function verifyCloudAgents(
  lease: SandboxLease,
  signal: AbortSignal,
  record: (check: CompatibilityCheck) => void,
): Promise<void> {
  const prefix = posix.join(lease.root, "cli-tools");
  const installed = await lease.invoke({
    executable: "npm",
    arguments: [
      "install",
      "--prefix",
      prefix,
      "--no-audit",
      "--no-fund",
      ...agentPackages.map((agent) => agent.package),
    ],
    signal,
    deadlineMs: 120_000,
    retain: 1024,
  });
  if (installed.status !== 0)
    throw cloudCommandFailure("agent-cli-installation", "agent-cli", installed);
  for (const agent of agentPackages) {
    const scenarios = agent.diagnostics();
    const executable = posix.join(
      prefix,
      "node_modules",
      ".bin",
      agent.executable,
    );
    const version = await lease.invoke({
      executable,
      arguments: ["--version"],
      signal,
      deadlineMs: compatibilityLimits.commandMs,
    });
    if (version.status !== 0)
      throw cloudCommandFailure(
        `${agent.executable}-cli-version`,
        "agent-cli",
        version,
      );
    const parsedVersion = (version.stdout + version.stderr).match(
      /\b\d+\.\d+\.\d+\b/,
    )?.[0];
    assert.ok(parsedVersion);
    record({
      name: `${agent.executable}-cli-version`,
      status: "pass",
      version: parsedVersion,
    });
    for (const scenario of scenarios) {
      const result = await lease.invoke({
        ...scenario.command,
        executable,
        signal,
        deadlineMs: compatibilityLimits.commandMs,
      });
      if (result.status !== 0)
        throw cloudCommandFailure(
          `${agent.executable}-cli-${scenario.mode}`,
          "agent-cli",
          result,
        );
      const output = result.stdout + result.stderr;
      assert.ok(output.includes(scenario.usage));
      for (const option of scenario.options) assert.ok(output.includes(option));
      record({
        name: `${agent.executable}-cli-${scenario.mode}`,
        status: "pass",
      });
    }
  }
}
