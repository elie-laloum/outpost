import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Sandbox as DaytonaSandbox } from "@daytona/sdk";
import { vercelFiles } from "../../src/providers/vercel-files.ts";
import { daytonaFiles } from "../../src/providers/daytona-files.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { verifyCloudModels } from "../fixtures/cloud-model-contract.ts";
import { verifyCloudAgents } from "../fixtures/cloud-agent-contract.ts";
import { runCloudCompatibility } from "../fixtures/cloud-compatibility.ts";
import type { CompatibilityOptions } from "../fixtures/cloud-compatibility.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";

const environment = {
  OUTPOST_CLOUD_LIVE: "1",
  OUTPOST_CLOUD_PROVIDERS: "daytona",
  DAYTONA_API_KEY: "fake-never-sent",
};

test("cloud runner skips without opt-in or credentials and never allocates", async () => {
  for (const env of [
    {},
    { OUTPOST_CLOUD_LIVE: "1", OUTPOST_CLOUD_PROVIDERS: "vercel,daytona" },
  ]) {
    const reports = await runCloudCompatibility({
      environment: env,
      create: () => {
        throw new Error("must not allocate");
      },
    });
    assert.ok(reports.every((report) => report.status === "skipped"));
  }
});

for (const backend of ["vercel", "daytona"])
  test(
    `${backend} transfer fixture executes real local processes and binary batch transfers`,
    {
      skip:
        process.platform === "win32"
          ? "POSIX modes and symlinks require Unix"
          : false,
    },
    async () => {
      const sandboxProvider = localSandboxProvider();
      const reports = await runCloudCompatibility({
        environment,
        create: () => ({
          ...sandboxProvider,
          acquire: async (context) => {
            const lease = await sandboxProvider.acquire(context);
            const files =
              backend === "vercel"
                ? vercelFiles({
                    mkDir: (path: string) => mkdir(path, { recursive: true }),
                    writeFiles: async (
                      entries: { path: string; content: Buffer }[],
                    ) => {
                      for (const entry of entries) {
                        await mkdir(dirname(entry.path), { recursive: true });
                        await writeFile(entry.path, entry.content);
                      }
                    },
                    readFile: async ({ path }: { path: string }) =>
                      Readable.from([await readFile(path)]),
                    runCommand: async (executable: string, args: string[]) => {
                      const result = await lease.invoke({
                        executable,
                        arguments: args,
                      });
                      return {
                        exitCode: result.status,
                        stdout: async () => result.stdout,
                      };
                    },
                  } as unknown as VercelSandbox)
                : daytonaFiles({
                    fs: {
                      createFolder: (path: string) =>
                        mkdir(path, { recursive: true }),
                      uploadFile: (data: Buffer, path: string) =>
                        writeFile(path, data),
                      downloadFile: (path: string) => readFile(path),
                    },
                    process: {
                      executeCommand: async (script: string) => {
                        const result = await lease.invoke({
                          executable: "sh",
                          arguments: ["-c", script],
                        });
                        return {
                          exitCode: result.status,
                          result: result.stdout,
                        };
                      },
                    },
                  } as unknown as DaytonaSandbox);
            const remoteLease = { ...lease, ...files };
            return { ...remoteLease, fileTransfers: fileBatches(remoteLease) };
          },
        }),
      });
      assert.equal(reports[1]?.status, "pass", JSON.stringify(reports));
      for (const name of [
        "process-completion",
        "cancellation-and-reuse",
        "binary-paths-permissions-symlinks",
        "batch-transfer",
        "cleanup",
      ])
        assert.equal(
          reports[1]?.checks.find((check) => check.name === name)?.status,
          "pass",
        );
      assert.equal(
        reports[1]?.checks.find(
          (check) => check.name === "authenticated-model-turn",
        )?.status,
        "skipped",
      );
    },
  );

test("cloud runner cleans partial failures and never exposes exception contents", async () => {
  let released = 0;
  const sandboxProvider = localSandboxProvider();
  const create: CompatibilityOptions["create"] = () => ({
    ...sandboxProvider,
    acquire: async (context) => {
      const lease = await sandboxProvider.acquire(context);
      return {
        ...lease,
        release: async () => {
          released++;
          await lease.release();
        },
      };
    },
  });
  const reports = await runCloudCompatibility({
    environment,
    create,
    verify: async () => {
      throw new Error("secret-token private-file-content");
    },
  });
  assert.equal(reports[1]?.status, "fail");
  assert.equal(released, 2);
  assert.doesNotMatch(
    JSON.stringify(reports),
    /secret-token|private-file-content|fake-never-sent/,
  );
  assert.equal(
    reports[1]?.checks.find((check) => check.name === "cleanup")?.status,
    "pass",
  );
});

test("cloud runner reports cleanup failure even after successful checks", async () => {
  const sandboxProvider = localSandboxProvider();
  const reports = await runCloudCompatibility({
    environment,
    create: () => ({
      ...sandboxProvider,
      acquire: async (context) => {
        const lease = await sandboxProvider.acquire(context);
        return {
          ...lease,
          release: async () => {
            await lease.release();
            throw new Error("private cleanup error");
          },
        };
      },
    }),
    verify: async () => {},
  });
  assert.equal(reports[1]?.status, "fail");
  assert.equal(
    reports[1]?.checks.find((check) => check.name === "cleanup")?.status,
    "fail",
  );
  assert.doesNotMatch(JSON.stringify(reports), /private cleanup error/);
});

test("cloud runner bounds stuck verification and releases a late acquisition", async () => {
  const sandboxProvider = localSandboxProvider();
  const stuck = await runCloudCompatibility({
    environment,
    create: () => sandboxProvider,
    deadlineMs: 20,
    verify: async () => new Promise(() => {}),
  });
  assert.equal(stuck[1]?.status, "fail");
  assert.equal(
    stuck[1]?.checks.find((check) => check.name === "lease-contract")?.reason,
    "deadline-exceeded",
  );
  let resolveLease!: (lease: SandboxLease) => void;
  let released = 0;
  const reports = await runCloudCompatibility({
    environment,
    deadlineMs: 20,
    cleanupMs: 20,
    create: () => ({
      ...sandboxProvider,
      acquire: () =>
        new Promise((resolve) => {
          resolveLease = resolve;
        }),
    }),
  });
  assert.equal(reports[1]?.status, "fail");
  resolveLease({
    root: "/unused",
    home: "/unused",
    invoke: async () => ({ status: 0, stdout: "", stderr: "" }),
    upload: async () => {},
    download: async () => {},
    release: async () => {
      released++;
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(released, 1);
});

test("standalone cloud runner reports skipped with exit 2 when disabled", async () => {
  const result = await executeProcess({
    executable: process.execPath,
    arguments: ["test/cloud-live.ts"],
    variables: { OUTPOST_CLOUD_LIVE: "0" },
  });
  assert.equal(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.match(report.source.commit, /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
  assert.equal(typeof report.source.dirty, "boolean");
  assert.equal(report.node, process.version);
  assert.ok(Number.isFinite(Date.parse(report.startedAt)));
  assert.ok(
    report.reports.every(
      (sandboxProvider: { status: string }) =>
        sandboxProvider.status === "skipped",
    ),
  );
});

test("agent CLI probes only request installation, versions and adapter help", async () => {
  const calls: string[] = [];
  const checks: string[] = [];
  let missingKimiOption = false;
  const lease: SandboxLease = {
    root: "/fixture",
    home: "/fixture",
    upload: async () => {},
    download: async () => {},
    release: async () => {},
    invoke: async (command) => {
      calls.push(command.executable);
      const args = command.arguments ?? [];
      if (command.executable === "npm") {
        assert.equal(args[0], "install");
        assert.ok(args.includes("@github/copilot"));
        assert.ok(args.includes("@moonshot-ai/kimi-code"));
        return { status: 0, stdout: "", stderr: "" };
      }
      assert.ok(args.includes("--help") || args.includes("--version"));
      return {
        status: 0,
        stdout: [
          "1.2.3",
          "Usage: codex exec [",
          "Usage: codex exec resume [",
          "Usage: codex exec fork [",
          "Usage: claude [",
          "Usage: copilot [ --output-format --allow-all --no-ask-user",
          missingKimiOption
            ? "Usage: kimi ["
            : "Usage: kimi [ --prompt --output-format",
          ...args,
        ].join(" "),
        stderr: "",
      };
    },
  };
  await verifyCloudAgents(lease, new AbortController().signal, (check) =>
    checks.push(check.name),
  );
  assert.equal(calls.length, 13);
  assert.deepEqual(checks, [
    "codex-cli-version",
    "codex-cli-start",
    "codex-cli-resume",
    "codex-cli-fork",
    "claude-cli-version",
    "claude-cli-start",
    "claude-cli-resume",
    "claude-cli-fork",
    "copilot-cli-version",
    "copilot-cli-start",
    "kimi-cli-version",
    "kimi-cli-start",
  ]);
  missingKimiOption = true;
  await assert.rejects(
    verifyCloudAgents(lease, new AbortController().signal, () => {}),
    { code: "ERR_ASSERTION" },
  );
});

for (const failure of [
  {
    cause: Object.assign(new Error("private-token"), { statusCode: 401 }),
    category: "allocation",
    reason: "authentication-rejected",
  },
  {
    cause: { response: { status: 403 }, message: "private-token" },
    category: "allocation",
    reason: "authentication-rejected",
  },
  {
    cause: Object.assign(new Error("private-token"), { statusCode: 429 }),
    category: "allocation",
    reason: "quota-exceeded",
  },
  {
    cause: new Error("private-token", { cause: { code: "ECONNREFUSED" } }),
    category: "network",
    reason: "network-unreachable",
  },
]) {
  test(`cloud allocation reports ${failure.reason} without exposing credentials`, async () => {
    const reports = await runCloudCompatibility({
      environment,
      create: () => ({
        name: "daytona",
        placement: "remote",
        acquire: async () => {
          throw failure.cause;
        },
      }),
    });
    const check = reports[1]?.checks.find(
      (check) => check.name === "allocation",
    );
    assert.equal(check?.reason, failure.reason);
    assert.equal(check?.category, failure.category);
    assert.doesNotMatch(
      JSON.stringify(reports),
      /private-token|fake-never-sent/,
    );
  });
}

test("cloud runner confirms cleanup for allocations arriving during the cleanup window", async () => {
  let released = 0;
  const reports = await runCloudCompatibility({
    environment,
    deadlineMs: 10,
    cleanupMs: 1000,
    create: () => ({
      name: "daytona",
      placement: "remote",
      acquire: async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
          root: "/unused",
          home: "/unused",
          invoke: async () => ({ status: 0, stdout: "", stderr: "" }),
          upload: async () => {},
          download: async () => {},
          release: async () => {
            released++;
          },
        };
      },
    }),
  });
  assert.equal(released, 1);
  assert.equal(
    reports[1]?.checks.find((check) => check.name === "allocation")?.reason,
    "deadline-exceeded",
  );
  assert.deepEqual(
    reports[1]?.checks.find((check) => check.name === "cleanup"),
    { name: "cleanup", status: "pass", reason: "late-allocation-released" },
  );
});

for (const agent of ["claude", "codex"] as const) {
  test(`cloud runner preserves ${agent} failure attribution and releases the lease`, async () => {
    const sandboxProvider = localSandboxProvider();
    const reports = await runCloudCompatibility({
      environment,
      create: () => ({
        ...sandboxProvider,
        acquire: async (context) => {
          const lease = await sandboxProvider.acquire(context);
          return {
            ...lease,
            invoke: async () => ({
              status: 1,
              stdout: JSON.stringify({
                error: {
                  code:
                    agent === "claude"
                      ? "insufficient_quota"
                      : "invalid_api_key",
                  message: "private-model-key",
                },
              }),
              stderr: "",
            }),
          };
        },
      }),
      verify: (lease, _directory, signal, record) =>
        verifyCloudModels(
          lease,
          {
            OUTPOST_CLOUD_MODEL_AGENTS: agent,
            ANTHROPIC_API_KEY: "private-model-key",
            OPENAI_API_KEY: "private-model-key",
          },
          signal,
          record,
        ),
    });
    const failed = reports[1]?.checks.find((check) => check.status === "fail");
    assert.equal(
      failed?.name,
      agent === "claude"
        ? "claude-authenticated-model-turn"
        : "codex-agent-login",
    );
    assert.equal(
      failed?.category,
      agent === "claude" ? "model-access" : "agent-authentication",
    );
    assert.equal(
      failed?.reason,
      agent === "claude" ? "quota-exceeded" : "authentication-rejected",
    );
    assert.equal(
      reports[1]?.checks.find((check) => check.name === "cleanup")?.status,
      "pass",
    );
    assert.doesNotMatch(JSON.stringify(reports), /private-model-key/);
  });
}
