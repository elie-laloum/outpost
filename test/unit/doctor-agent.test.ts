import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnoseAgentCli } from "../../src/application/doctor-agent.ts";
import { claudeDiagnostics } from "../../src/adapters/agents/claude-diagnostics.ts";
import { codexDiagnostics } from "../../src/adapters/agents/codex-diagnostics.ts";
import { OutpostError } from "../../src/domain/errors.ts";

const claudeHelp = `Usage: claude [options] [prompt]
  -p, --print                 Print the result
  --verbose                  Verbose output
  --output-format <format>   Output format
  --dangerously-skip-permissions
  -r, --resume <session>      Resume a session
  --fork-session             Fork the session
`;

function codexHelp(mode: string): string {
  return `Usage: codex exec${mode === "start" ? "" : ` ${mode}`} [OPTIONS] [PROMPT]
      --dangerously-bypass-approvals-and-sandbox
      --json
`;
}

test("CLI diagnostic recipes use headless default adapter requests with help and empty input", () => {
  for (const plans of [codexDiagnostics(), claudeDiagnostics()]) {
    assert.deepEqual(
      plans.map((plan) => plan.mode),
      ["start", "resume", "fork"],
    );
    for (const plan of plans) {
      assert.equal(plan.command.arguments?.at(-1), "--help");
      assert.equal(plan.command.stdin, "");
      assert.notEqual(plan.command.interactive, true);
      assert.ok(plan.options.length > 0);
      assert.ok(!plan.options.includes("--help"));
      assert.equal(plan.command.variables, undefined);
    }
  }
  assert.ok(codexDiagnostics()[2]!.command.arguments?.includes("fork"));
  assert.ok(
    claudeDiagnostics()[2]!.command.arguments?.includes("--fork-session"),
  );
});

test("both agents report declared commands and options with bounded output and no stdin prompt", async () => {
  for (const agent of ["claude", "codex"] as const) {
    let index = 0;
    const checks = await diagnoseAgentCli(agent, async (command) => {
      assert.equal(command.deadlineMs, 5_000);
      assert.equal(command.retain, 65_536);
      assert.equal(command.stdin, "");
      assert.equal(command.arguments?.at(-1), "--help");
      const mode = ["start", "resume", "fork"][index++]!;
      return {
        status: 0,
        stdout: agent === "claude" ? claudeHelp : codexHelp(mode),
        stderr: "",
      };
    });
    assert.equal(index, 3);
    assert.deepEqual(
      checks.map((check) => check.id),
      ["agent.cli.start", "agent.cli.resume", "agent.cli.fork"],
    );
    assert.ok(checks.every((check) => check.status === "pass"));
    assert.ok(
      checks.every((check) =>
        /event decoding are not tested/.test(check.message),
      ),
    );
  }
});

test("successful help with a missing option fails even when that option appears in prose or as a prefix", async () => {
  const help = claudeHelp.replace(
    "  --fork-session             Fork the session",
    "  --fork-session-extra       Not the required option\nThis version has removed --fork-session.",
  );
  const checks = await diagnoseAgentCli("claude", async () => ({
    status: 0,
    stdout: help,
    stderr: "",
  }));
  assert.deepEqual(
    checks.map((check) => check.status),
    ["pass", "pass", "fail"],
  );
  assert.match(checks[2]!.message, /required options: --fork-session\./);
});

test("help for a parent command does not validate a missing resume or fork subcommand", async () => {
  const checks = await diagnoseAgentCli("codex", async () => ({
    status: 0,
    stdout: codexHelp("start"),
    stderr: "",
  }));
  assert.deepEqual(
    checks.map((check) => check.status),
    ["pass", "warn", "warn"],
  );
  assert.match(checks[1]!.message, /unverified/);
});

test("missing, truncated or unrelated successful output is unverified", async () => {
  for (const stdout of ["", "tool 0.156.1", "      --json\n"]) {
    const checks = await diagnoseAgentCli("codex", async () => ({
      status: 0,
      stdout,
      stderr: "",
    }));
    assert.ok(checks.every((check) => check.status === "warn"));
  }
});

test("help accepts ANSI styling, stderr and CRLF without including raw output in reports", async () => {
  const checks = await diagnoseAgentCli("claude", async () => ({
    status: 0,
    stdout: "",
    stderr: `\x1b[1m${claudeHelp.replaceAll("\n", "\r\n")}\x1b[0m\nprivate-output`,
  }));
  assert.ok(checks.every((check) => check.status === "pass"));
  assert.doesNotMatch(JSON.stringify(checks), /private-output/);
});

test("failed help and timeout remain failures while other modes are inspected", async () => {
  let index = 0;
  const checks = await diagnoseAgentCli("codex", async () => {
    index++;
    if (index === 1)
      return {
        status: 2,
        stdout: codexHelp("start"),
        stderr: "private-output",
      };
    if (index === 2) throw new OutpostError("timeout", "private-output");
    return { status: 0, stdout: codexHelp("fork"), stderr: "" };
  });
  assert.deepEqual(
    checks.map((check) => check.status),
    ["fail", "fail", "pass"],
  );
  assert.match(checks[0]!.message, /status 2/);
  assert.match(checks[1]!.message, /timed out/);
  assert.doesNotMatch(JSON.stringify(checks), /private-output/);
});
