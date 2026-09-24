import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnosticProbe } from "../../src/application/diagnostic-probe.ts";
import { diagnose } from "../../src/application/doctor.ts";
import { doctorDefaults } from "../../src/application/doctor.constants.ts";
import type { DiagnosticProbe } from "../../src/application/doctor.types.ts";
import { doctorCommand } from "../../src/cli/doctor-command.ts";
import type { Command } from "../../src/domain/command.types.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

const available = async (command: Command) => ({
  status: 0,
  stdout:
    command.executable === "codex"
      ? `codex-cli ${agentVersions.codex}`
      : "tool 2.40.0",
  stderr: "",
});

test("host diagnostics inspect only the selected container engine and bound every command", async () => {
  for (const provider of ["docker", "podman"] as const) {
    const calls: Command[] = [];
    const report = await diagnose(
      { provider, agent: "codex" },
      async (command) => {
        calls.push(command);
        return available(command);
      },
    );
    assert.equal(report.hasFailures, false);
    assert.equal(report.scope, "host");
    assert.equal(report.interactiveTerminal, true);
    assert.deepEqual(
      calls.map(({ executable, arguments: args }) => [executable, args]),
      [
        ["git", ["--version"]],
        [provider, ["--version"]],
        [provider, ["info"]],
        ["tar", ["--version"]],
        ["codex", ["--version"]],
      ],
    );
    assert.ok(
      calls.every(
        (call) =>
          call.deadlineMs === doctorDefaults.deadlineMs &&
          call.retain === doctorDefaults.retain,
      ),
    );
    assert.equal(
      report.checks.find((check) => check.id === "agent.host")?.status,
      "pass",
    );
    assert.equal(
      report.checks.find((check) => check.id === "agent.sandbox")?.status,
      "skipped",
    );
  }
});

test("missing engines skip connection attempts while all other diagnostics continue", async () => {
  const calls: string[] = [];
  const report = await diagnose(
    { provider: "docker", agent: "claude" },
    async (command) => {
      calls.push(command.executable);
      if (command.executable === "docker" || command.executable === "claude")
        throw Object.assign(new Error("private detail"), { code: "ENOENT" });
      return available(command);
    },
  );
  assert.equal(report.hasFailures, true);
  assert.deepEqual(calls, ["git", "docker", "tar", "claude"]);
  assert.equal(
    report.checks.find((check) => check.id === "agent.host")?.status,
    "warn",
  );
  assert.doesNotMatch(JSON.stringify(report), /private detail/);
});

test("unreachable engine is a failure even when its CLI works", async () => {
  const report = await diagnose(
    { provider: "podman", agent: "codex" },
    async (command) => {
      if (command.arguments?.[0] === "info")
        return { status: 125, stdout: "", stderr: "private engine config" };
      return available(command);
    },
  );
  assert.equal(report.hasFailures, true);
  assert.match(
    report.checks.find((check) => check.id === "provider.connection")!.message,
    /125.*running/,
  );
  assert.doesNotMatch(JSON.stringify(report), /private engine config/);
});

test("local and cloud diagnostics never allocate a sandbox or require unrelated tools", async () => {
  for (const provider of ["local", "vercel", "daytona"] as const) {
    const calls: string[] = [];
    const report = await diagnose(
      { provider, agent: "claude" },
      async (command) => {
        calls.push(command.executable);
        return available(command);
      },
    );
    assert.deepEqual(calls, ["git", "claude"]);
    assert.equal(report.hasFailures, false);
    assert.equal(report.interactiveTerminal, provider !== "vercel");
    assert.equal(
      report.checks.some(
        (check) => check.id === "provider.cloud" && check.status === "skipped",
      ),
      provider !== "local",
    );
    assert.equal(
      report.checks.find((check) => check.id === "agent.host")?.status,
      "warn",
    );
  }
});

test("probes distinguish unverified versions, nonzero exits, timeout and execution failures", async () => {
  const probe: DiagnosticProbe = {
    id: "agent",
    command: { executable: "claude" },
    failureStatus: "warn",
    remedy: "Check PATH.",
    readVersion: true,
    referenceVersion: agentVersions.claude,
  };
  const same = await diagnosticProbe(probe, async () => ({
    status: 0,
    stdout: "",
    stderr: `${agentVersions.claude} (Claude Code)`,
  }));
  assert.equal(same.status, "pass");
  const prerelease = await diagnosticProbe(probe, async () => ({
    status: 0,
    stdout: `${agentVersions.claude}-beta.1`,
    stderr: "",
  }));
  assert.equal(prerelease.status, "warn");
  assert.equal(prerelease.version, `${agentVersions.claude}-beta.1`);
  const unknown = await diagnosticProbe(probe, async () => ({
    status: 0,
    stdout: "unknown",
    stderr: "",
  }));
  assert.match(unknown.message, /could not be identified/);
  const nonzero = await diagnosticProbe(probe, async () => ({
    status: 1,
    stdout: agentVersions.claude,
    stderr: "secret",
  }));
  assert.match(nonzero.message, /status 1/);
  for (const [error, message] of [
    [new OutpostError("timeout", "secret"), /timed out/],
    [new Error("secret"), /could not be executed/],
    [undefined, /could not be executed/],
  ] as const) {
    const result = await diagnosticProbe(probe, async () => {
      throw error;
    });
    assert.equal(result.status, "warn");
    assert.match(result.message, message);
    assert.doesNotMatch(result.message, /secret/);
  }
});

test("doctor formats human and JSON reports and reserves failure exit status for failed checks", async (t) => {
  let output = "";
  const previousExitCode = process.exitCode;
  t.after(() => {
    process.exitCode = previousExitCode;
  });
  const write = (chunk: string) => {
    output += chunk;
  };
  await doctorCommand(
    { positionals: ["doctor"], values: {} },
    available,
    write,
  );
  assert.match(output, /host checks \(docker, codex\)/);
  assert.match(output, /pinned:/);
  assert.match(output, /No blocking check failed/);
  output = "";
  await doctorCommand(
    {
      positionals: ["doctor"],
      values: { provider: "vercel", agent: "claude" },
    },
    available,
    write,
  );
  assert.match(output, /interactive terminal: unsupported/);
  output = "";
  await doctorCommand(
    { positionals: ["doctor"], values: { provider: "local", json: true } },
    available,
    write,
  );
  const report = JSON.parse(output);
  assert.equal(report.scope, "host");
  assert.equal(report.hasFailures, false);
  assert.equal(process.exitCode, previousExitCode);
  output = "";
  await doctorCommand(
    { positionals: ["doctor"], values: {} },
    async () => ({
      status: 1,
      stdout: "",
      stderr: "secret",
    }),
    write,
  );
  assert.equal(process.exitCode, 1);
  assert.match(output, /Diagnostic checks found failures/);
  assert.doesNotMatch(output, /secret/);
});

test("doctor rejects invalid selections and unrelated options before probing", async () => {
  for (const values of [
    { provider: "constructor" },
    { agent: "constructor" },
    { directory: "directory" },
  ]) {
    await assert.rejects(
      doctorCommand({ positionals: ["doctor"], values }, async () => {
        assert.fail("must not probe");
      }),
      /Unknown|Unsupported/,
    );
  }
  await assert.rejects(
    doctorCommand({ positionals: ["doctor", "extra"], values: {} }),
    /Usage/,
  );
});
