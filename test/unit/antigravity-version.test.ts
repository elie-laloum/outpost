import { test } from "node:test";
import assert from "node:assert/strict";
import { antigravityRequest } from "../../src/adapters/agents/antigravity-request.ts";
import { antigravityDiagnostics } from "../../src/adapters/agents/antigravity-diagnostics.ts";
import { agentVersionProbe } from "../../src/application/doctor-agent.ts";
import { diagnosticProbe } from "../../src/application/diagnostic-probe.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

test("Antigravity requests and diagnostics disable automatic updates", () => {
  for (const command of [
    antigravityRequest({}, { text: "hello" }),
    antigravityRequest({}, { interactive: true }),
    agentVersionProbe("antigravity").command,
    ...antigravityDiagnostics().map((plan) => plan.command),
  ])
    assert.equal(command.variables?.AGY_CLI_DISABLE_AUTO_UPDATE, "true");
});

test("Antigravity doctor compares the installed version to the pinned reference", async () => {
  for (const [version, status] of [
    [agentVersions.antigravity, "pass"],
    ["0.0.1", "warn"],
  ] as const) {
    const result = await diagnosticProbe(
      {
        id: "agent.host",
        ...agentVersionProbe("antigravity"),
        failureStatus: "fail",
        remedy: "Install agy.",
      },
      async () => ({ status: 0, stdout: `agy ${version}`, stderr: "" }),
    );
    assert.equal(result.status, status);
    assert.equal(result.version, version);
    assert.equal(result.referenceVersion, agentVersions.antigravity);
  }
});
