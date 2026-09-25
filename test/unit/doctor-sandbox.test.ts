import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnoseSandbox } from "../../src/application/doctor-sandbox.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { sandboxDiagnosticDefaults } from "../../src/application/doctor-sandbox.constants.ts";
import { transferDiagnosticRecipe } from "../../src/application/doctor-transfers.constants.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

function fixture(): SandboxLease {
  return {
    root: "/fixture",
    home: "/fixture-home",
    async invoke(command) {
      assert.ok(command.deadlineMs && command.deadlineMs <= 60000);
      assert.ok(command.retain && command.retain <= 65536);
      assert.ok(command.signal);
      if (command.arguments?.includes("--help"))
        assert.equal(command.retain, 65536);
      if (command.arguments?.[1] === sandboxDiagnosticDefaults.command)
        return {
          status: 7,
          stdout: "outpost-stdout",
          stderr: "outpost-stderr",
        };
      if (command.arguments?.[0] === "--version")
        return {
          status: 0,
          stdout:
            command.executable === "codex" ? agentVersions.codex : "24.15.0",
          stderr: "",
        };
      return { status: 0, stdout: "", stderr: "" };
    },
    async upload() {
      assert.fail("unexpected upload");
    },
    async download() {
      assert.fail("unexpected download");
    },
    async release() {
      assert.fail("unexpected release");
    },
  };
}

test("bounded owned probes distinguish advertised capabilities, observations and unverified CLI help", async () => {
  const lease = fixture();
  const report = await diagnoseSandbox(
    {
      ...lease,
      fileTransfers: {
        async manifest() {
          return [];
        },
        async downloadBatch() {},
      },
    },
    {
      agent: "codex",
      deadlineMs: 300,
      sandboxProvider: { name: "custom-cloud", placement: "remote" },
    },
  );
  assert.equal(report.hasFailures, false);
  assert.equal(report.modelCompatibility, "unverified");
  assert.deepEqual(report.capabilities, [
    { id: "command", advertised: true, observed: "pass" },
    { id: "transfers", advertised: true, observed: "unverified" },
    { id: "batchTransfers", advertised: true, observed: "unverified" },
    {
      id: "interactiveTerminal",
      advertised: "unknown",
      observed: "unverified",
    },
  ]);
  assert.equal(
    report.checks.filter(
      (check) => check.id.startsWith("agent.cli") && check.status === "warn",
    ).length,
    3,
  );
});

test("invalid limits and pre-cancellation make no calls", async () => {
  const lease = {
    ...fixture(),
    async invoke() {
      assert.fail("unexpected invoke");
    },
  };
  for (const deadlineMs of [0, -1, 60001, NaN, 1.5])
    await assert.rejects(diagnoseSandbox(lease, { deadlineMs }), /deadlineMs/);
  await assert.rejects(
    diagnoseSandbox(lease, { signal: AbortSignal.abort(new Error("stop")) }),
    /stop/,
  );
});

test("failed command, home and missing agent do not report compatibility or leak output", async () => {
  const report = await diagnoseSandbox(
    {
      ...fixture(),
      async invoke() {
        return { status: 3, stdout: "private-output", stderr: "secret" };
      },
    },
    { agent: "claude" },
  );
  assert.equal(report.hasFailures, true);
  assert.equal(report.capabilities[0]?.observed, "fail");
  assert.ok(!report.checks.some((check) => check.id.startsWith("agent.cli")));
  assert.doesNotMatch(JSON.stringify(report), /private-output|secret/);
});

test("thrown command failures are sanitized and all diagnostics stay on the supplied lease", async () => {
  const report = await diagnoseSandbox({
    ...fixture(),
    async invoke() {
      throw new Error("private-provider-token");
    },
  });
  assert.equal(report.hasFailures, true);
  assert.doesNotMatch(JSON.stringify(report), /private-provider-token/);
});

test("transfer cleanup is attempted after failure without releasing the lease", async () => {
  const lease = fixture();
  let cleanups = 0;
  const report = await diagnoseSandbox(
    {
      ...lease,
      async upload() {
        throw new Error("private-transfer-error");
      },
      async invoke(command) {
        if (command.arguments?.[1] === transferDiagnosticRecipe.cleanup) {
          cleanups++;
          return { status: 4, stdout: "secret", stderr: "" };
        }
        return lease.invoke(command);
      },
    },
    { transfers: true },
  );
  assert.equal(cleanups, 1);
  assert.ok(
    report.checks.some(
      (check) =>
        check.id === "sandbox.transfers.cleanup" && check.status === "fail",
    ),
  );
  assert.doesNotMatch(JSON.stringify(report), /private-transfer-error|secret/);
});

test("failed directory creation never removes an unowned directory", async () => {
  const lease = fixture();
  const report = await diagnoseSandbox(
    {
      ...lease,
      async invoke(command) {
        assert.notEqual(
          command.arguments?.[1],
          transferDiagnosticRecipe.cleanup,
        );
        if (command.arguments?.[1] === transferDiagnosticRecipe.create)
          return { status: 1, stdout: "", stderr: "" };
        return lease.invoke(command);
      },
    },
    { transfers: true },
  );
  assert.equal(
    report.capabilities.find((item) => item.id === "transfers")?.observed,
    "fail",
  );
});

test("partial creation with unavailable cleanup reports the recovery path", async () => {
  const lease = fixture();
  let attempted = false;
  const report = await diagnoseSandbox(
    {
      ...lease,
      async invoke(command) {
        if (command.arguments?.[1] === transferDiagnosticRecipe.create)
          throw new Error("response lost");
        if (command.arguments?.[1] === transferDiagnosticRecipe.cleanup) {
          attempted = true;
          throw new Error("offline");
        }
        return lease.invoke(command);
      },
    },
    { transfers: true },
  );
  assert.equal(attempted, true);
  assert.match(
    report.checks.find((check) => check.id === "sandbox.transfers.cleanup")!
      .message,
    /\/fixture\/\.outpost-probe-/,
  );
});
