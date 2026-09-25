import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Sandbox as DaytonaSandbox } from "@daytona/sdk";
import { vercelFiles } from "../../src/providers/vercel-files.ts";
import { daytonaFiles } from "../../src/providers/daytona-files.ts";
import { local } from "../../src/providers/local.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
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
      const provider = local();
      const reports = await runCloudCompatibility({
        environment,
        create: () => ({
          ...provider,
          acquire: async (context) => {
            const lease = await provider.acquire(context);
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
  const provider = local();
  const create: CompatibilityOptions["create"] = () => ({
    ...provider,
    acquire: async (context) => {
      const lease = await provider.acquire(context);
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
  const provider = local();
  const reports = await runCloudCompatibility({
    environment,
    create: () => ({
      ...provider,
      acquire: async (context) => {
        const lease = await provider.acquire(context);
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
  const provider = local();
  const stuck = await runCloudCompatibility({
    environment,
    create: () => provider,
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
    create: () => ({
      ...provider,
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
      (provider: { status: string }) => provider.status === "skipped",
    ),
  );
});

test("agent CLI probes only request installation, versions and adapter help", async () => {
  const calls: string[] = [];
  const checks: string[] = [];
  let missingGeminiOption = false;
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
        assert.ok(args.includes("@google/gemini-cli"));
        return { status: 0, stdout: "", stderr: "" };
      }
      assert.ok(args.includes("--help") || args.includes("--version"));
      return {
        status: 0,
        stdout: [
          "1.2.3",
          "codex exec resume",
          "codex exec fork",
          "claude",
          missingGeminiOption
            ? "gemini"
            : "gemini --approval-mode --skip-trust --output-format",
          ...args,
        ].join(" "),
        stderr: "",
      };
    },
  };
  await verifyCloudAgents(lease, new AbortController().signal, (check) =>
    checks.push(check.name),
  );
  assert.equal(calls.length, 11);
  assert.deepEqual(checks, [
    "codex-cli-version",
    "codex-cli-start",
    "codex-cli-resume",
    "codex-cli-fork",
    "claude-cli-version",
    "claude-cli-start",
    "claude-cli-resume",
    "claude-cli-fork",
    "gemini-cli-version",
    "gemini-cli-start",
  ]);
  missingGeminiOption = true;
  await assert.rejects(
    verifyCloudAgents(lease, new AbortController().signal, () => {}),
    { code: "ERR_ASSERTION" },
  );
});
