import assert from "node:assert/strict";
import { access, rm } from "node:fs/promises";
import { test } from "node:test";
import { diagnoseImage } from "../../src/application/doctor-image.ts";
import { diagnose } from "../../src/application/doctor.ts";
import { doctorCommand } from "../../src/cli/doctor-command.ts";
import { diagnosticProbe } from "../../src/application/diagnostic-probe.ts";
import type { Command } from "../../src/domain/command.types.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

function fixture() {
  const calls: Command[] = [];
  let directory = "";
  let name = "";
  const execute = async (command: Command) => {
    calls.push(command);
    const args = command.arguments ?? [];
    if (args[0] === "create") {
      name = args[args.indexOf("--name") + 1]!;
      const volumeIndex = args.indexOf("--volume");
      const mount =
        volumeIndex >= 0
          ? args[volumeIndex + 1]!
          : args[args.indexOf("--mount") + 1]!;
      directory =
        volumeIndex >= 0
          ? mount.slice(0, mount.lastIndexOf(":/workspace:"))
          : mount.split("source=")[1]!.split(",target=")[0]!;
    }
    if (args[0] === "machine")
      return {
        status: 0,
        stdout: JSON.stringify([{ Running: true }]),
        stderr: "",
      };
    if (args[0] === "image") return { status: 0, stdout: "", stderr: "" };
    const inner = args.indexOf("outpost");
    const binary = inner >= 0 ? args[inner + 1] : command.executable;
    if (args.at(-1) === "--help") {
      const invocation = args.slice(inner + 2, -1);
      const mode = invocation.includes("fork")
        ? " fork"
        : invocation.includes("resume")
          ? " resume"
          : "";
      const usage = binary === "codex" ? `codex exec${mode}` : "claude";
      return {
        status: 0,
        stdout: `Usage: ${usage} [OPTIONS]\n${invocation
          .filter((item) => item.startsWith("--"))
          .map((item) => `  ${item}`)
          .join("\n")}`,
        stderr: "",
      };
    }
    const versions: Record<string, string> = {
      node: "v24.15.0",
      git: "git version 2.53.0",
      codex: `codex-cli ${agentVersions.codex}`,
      claude: `${agentVersions.claude} (Claude Code)`,
    };
    return {
      status: 0,
      stdout: versions[binary ?? ""] ?? "version 5.0.0",
      stderr: "",
    };
  };
  return { calls, execute, directory: () => directory, name: () => name };
}

test("image diagnostics use an isolated temporary workspace, pinned image and cleanup for both engines", async () => {
  for (const sandboxProvider of ["docker", "podman"] as const) {
    const runtime = fixture();
    const report = await diagnose(
      { sandboxProvider, agent: "codex", image: "outpost:test" },
      runtime.execute,
    );
    assert.equal(report.scope, "host-and-image");
    assert.equal(report.image, "outpost:test");
    assert.equal(report.hasFailures, false);
    assert.equal(
      report.checks.filter(
        (check) => check.id.startsWith("agent.cli.") && check.status === "pass",
      ).length,
      3,
    );
    assert.equal(
      report.checks.find((check) => check.id === "image.node")?.version,
      "24.15.0",
    );
    assert.equal(
      report.checks.find((check) => check.id === "agent.sandbox")?.status,
      "pass",
    );
    const create = runtime.calls.find(
      (call) => call.arguments?.[0] === "create",
    )!;
    assert.ok(create.arguments?.includes("--pull=never"));
    assert.equal(
      create.arguments?.[create.arguments.indexOf("--network") + 1],
      "none",
    );
    assert.ok(create.arguments?.includes("--cap-drop"));
    assert.ok(create.arguments?.includes("--tmpfs"));
    assert.ok(!create.arguments?.includes("--env"));
    assert.ok(!create.arguments?.some((arg) => arg.includes(process.cwd())));
    assert.ok(runtime.calls.every((command) => command.deadlineMs! <= 5_000));
    assert.ok(
      runtime.calls.some(
        (command) =>
          command.arguments?.join(" ") === `rm --force ${runtime.name()}`,
      ),
    );
    await assert.rejects(access(runtime.directory()));
  }
});

test("failed, timed-out and unrecognized agent commands still remove the diagnostic container", async () => {
  for (const failure of ["exit", "timeout", "version"] as const) {
    const runtime = fixture();
    const checks = await diagnoseImage(
      { sandboxProvider: "docker", agent: "claude", image: "outpost:test" },
      async (command) => {
        const args = command.arguments ?? [];
        if (args[args.indexOf("outpost") + 1] === "claude") {
          if (failure === "timeout")
            throw new OutpostError("timeout", "private detail");
          return {
            status: failure === "exit" ? 7 : 0,
            stdout: "",
            stderr: "private detail",
          };
        }
        return runtime.execute(command);
      },
    );
    assert.equal(
      checks.find((check) => check.id === "agent.sandbox")?.status,
      "fail",
    );
    assert.equal(
      checks.find((check) => check.id === "image.cleanup")?.status,
      "pass",
    );
    assert.equal(
      checks.find((check) => check.id === "agent.cli")?.status,
      "skipped",
    );
    assert.doesNotMatch(JSON.stringify(checks), /private detail/);
    await assert.rejects(access(runtime.directory()));
  }
});

test("image startup errors clean up partial allocation and do not execute probes", async () => {
  const runtime = fixture();
  const checks = await diagnoseImage(
    { sandboxProvider: "docker", agent: "codex", image: "outpost:test" },
    async (command) => {
      const result = await runtime.execute(command);
      if (command.arguments?.[0] === "start")
        return { ...result, status: 125, stderr: "private detail" };
      return result;
    },
  );
  assert.equal(checks[0]?.id, "image.runtime");
  assert.equal(checks[0]?.status, "fail");
  assert.ok(runtime.calls.some((command) => command.arguments?.[0] === "rm"));
  assert.ok(
    !runtime.calls.some((command) => command.arguments?.includes("--version")),
  );
  await assert.rejects(access(runtime.directory()));
});

test("cleanup failures report the owned container and preserve its temporary workspace", async (t) => {
  for (const failStartup of [false, true]) {
    const runtime = fixture();
    const checks = await diagnoseImage(
      { sandboxProvider: "docker", agent: "codex", image: "outpost:test" },
      async (command) => {
        const result = await runtime.execute(command);
        if (
          command.arguments?.[0] === "rm" ||
          (failStartup && command.arguments?.[0] === "start")
        )
          return { ...result, status: 1 };
        return result;
      },
    );
    t.after(() => rm(runtime.directory(), { recursive: true, force: true }));
    const cleanup = checks.find((check) => check.id === "image.cleanup");
    assert.equal(cleanup?.status, "fail");
    assert.ok(cleanup?.message.includes(runtime.name()));
    assert.ok(cleanup?.message.includes(runtime.directory()));
    await access(runtime.directory());
  }
});

test("missing image and disconnected engine do not attempt allocation", async () => {
  const runtime = fixture();
  const checks = await diagnoseImage(
    { sandboxProvider: "docker", agent: "codex", image: "missing:image" },
    async (command) => {
      const result = await runtime.execute(command);
      return { ...result, status: 1 };
    },
  );
  assert.equal(checks[0]?.status, "fail");
  assert.ok(
    !runtime.calls.some((command) => command.arguments?.[0] === "create"),
  );
  const report = await diagnose(
    { sandboxProvider: "docker", agent: "codex", image: "outpost:test" },
    async (command) => {
      if (command.arguments?.[0] === "info")
        return { status: 1, stdout: "", stderr: "" };
      return runtime.execute(command);
    },
  );
  assert.equal(
    report.checks.find((check) => check.id === "image.runtime")?.status,
    "skipped",
  );
  assert.ok(
    !runtime.calls.some((command) => command.arguments?.[0] === "create"),
  );
});

test("image CLI validates its selection before commands and includes image checks in human output", async () => {
  for (const values of [
    { sandboxProvider: "local", image: "outpost:test" },
    { image: "" },
    { image: "--privileged" },
    { image: "image\ninjected" },
  ]) {
    await assert.rejects(
      doctorCommand({ positionals: ["doctor"], values }, async () => {
        assert.fail("must not execute");
      }),
      /requires|Invalid/,
    );
  }
  let output = "";
  const write = (text: string) => {
    output += text;
  };
  await doctorCommand(
    { positionals: ["doctor"], values: { image: "outpost:test" } },
    fixture().execute,
    write,
  );
  assert.match(output, /host and image checks/);
  assert.match(output, /Image: outpost:test/);
  assert.match(output, /\[PASS\] agent.sandbox/);
  assert.match(output, /\[PASS\] image.cleanup/);
});

test("version diagnostics recognize the v prefix emitted by Node", async () => {
  const check = await diagnosticProbe(
    {
      id: "node",
      command: { executable: "node" },
      failureStatus: "fail",
      readVersion: true,
      remedy: "Install Node.",
    },
    async () => ({ status: 0, stdout: "v24.15.0\n", stderr: "" }),
  );
  assert.equal(check.status, "pass");
  assert.equal(check.version, "24.15.0");
});

test("CLI help failures affect the JSON result and exit code while cleanup still completes", async (t) => {
  const runtime = fixture();
  const previousExitCode = process.exitCode;
  t.after(() => {
    process.exitCode = previousExitCode;
  });
  let output = "";
  await doctorCommand(
    { positionals: ["doctor"], values: { image: "outpost:test", json: true } },
    async (command) => {
      const args = command.arguments ?? [];
      if (args.at(-1) === "--help" && args.includes("fork"))
        return { status: 2, stdout: "", stderr: "private detail" };
      return runtime.execute(command);
    },
    (text) => {
      output += text;
    },
  );
  const report = JSON.parse(output);
  assert.equal(report.hasFailures, true);
  assert.equal(process.exitCode, 1);
  assert.ok(
    report.checks.some(
      (check: { id: string; status: string }) =>
        check.id === "agent.cli.fork" && check.status === "fail",
    ),
  );
  assert.ok(
    report.checks.some(
      (check: { id: string; status: string }) =>
        check.id === "image.cleanup" && check.status === "pass",
    ),
  );
  assert.doesNotMatch(output, /private detail/);
  await assert.rejects(access(runtime.directory()));
});
