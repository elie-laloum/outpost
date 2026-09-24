import assert from "node:assert/strict";
import { posix } from "node:path";
import { codexDiagnostics } from "../../src/adapters/agents/codex-diagnostics.ts";
import { geminiDiagnostics } from "../../src/adapters/agents/gemini-diagnostics.ts";
import { claudeDiagnostics } from "../../src/adapters/agents/claude-diagnostics.ts";
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
  assert.equal(installed.status, 0);
  const diagnostics = {
    codex: codexDiagnostics,
    claude: claudeDiagnostics,
    gemini: geminiDiagnostics,
  };
  for (const agent of agentPackages) {
    const scenarios = diagnostics[agent.executable]();
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
    assert.equal(version.status, 0);
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
      assert.equal(result.status, 0);
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
