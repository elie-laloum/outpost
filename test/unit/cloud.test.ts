import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PassThrough, Readable } from "node:stream";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Daytona } from "@daytona/sdk";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import {
  downloadTree,
  manifestScript,
  uploadTree,
} from "../../src/providers/cloud-files.ts";
import { observeInputFailure } from "../../src/infrastructure/input-failure.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test("Vercel contract streams bounded output, stages stdin and transfers files", async (t) => {
  const root = await repository(t),
    files = new Map<string, Buffer>(),
    invocations: unknown[] = [];
  let stopped = 0,
    killed = 0,
    fail = false;
  const sandbox = {
    mkDir: async () => {},
    stop: async () => {
      stopped++;
    },
    writeFiles: async (entries: { path: string; content: Buffer }[]) => {
      for (const item of entries) files.set(item.path, item.content);
    },
    readFile: async ({ path }: { path: string }) =>
      files.has(path) ? Readable.from([files.get(path)]) : null,
    runCommand: async (
      input: string | { detached?: boolean; args?: string[] },
      args?: string[],
    ) => {
      invocations.push([input, args]);
      if (typeof input === "string")
        return {
          exitCode: 0,
          stdout: async () =>
            input === "printenv"
              ? "/home/test\n"
              : JSON.stringify([{ path: "", kind: "file", mode: 420 }]),
        };
      return {
        async *logs() {
          if (fail) throw new Error("disconnected");
          yield { stream: "stdout", data: "streamed-data" };
          yield { stream: "stderr", data: "warning" };
        },
        wait: async () => ({ exitCode: 7 }),
        kill: async () => {
          killed++;
        },
      };
    },
  };
  const lease = await createVercelSandboxProvider(
    { retain: 4 },
    async () => sandbox as unknown as VercelSandbox,
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {
      ANTHROPIC_API_KEY: "allocation-key",
      CLAUDE_CODE_OAUTH_TOKEN: "subscription-token",
    },
  });
  assert.equal(lease.home, "/home/test");
  await lease.invoke({
    executable: "claude",
    variables: { ANTHROPIC_API_KEY: "command-key" },
  });
  const invocation = invocations.at(-1) as [{ env: Record<string, string> }];
  assert.deepEqual(invocation[0].env, {
    ANTHROPIC_API_KEY: "command-key",
    CLAUDE_CODE_OAUTH_TOKEN: "subscription-token",
  });

  let seen = "";
  const result = await lease.invoke({
    executable: "node",
    arguments: ["script"],
    stdin: "input",
    observe(_channel, text) {
      seen += text;
    },
  });
  assert.deepEqual(result, { status: 7, stdout: "data", stderr: "ning" });
  assert.equal(seen, "streamed-datawarning");
  assert.ok([...files.values()].some((value) => value.toString() === "input"));
  await lease.upload(join(root, "base.txt"), "/remote/base");
  await lease.download("/remote/base", join(root, "download"));
  assert.equal(await readFile(join(root, "download"), "utf8"), "base\n");
  fail = true;
  await assert.rejects(lease.invoke({ executable: "false" }), /disconnected/);
  assert.equal(killed, 1);
  await assert.rejects(
    lease.invoke({
      executable: "false",
      elevated: true,
      input: Readable.from([]),
    }),
    /disconnected/,
  );
  assert.ok(
    invocations.some(
      (value) =>
        Array.isArray(value) &&
        value[0] &&
        typeof value[0] === "object" &&
        value[0].sudo === true &&
        value[0].args?.some((arg: string) => arg.includes("kill -KILL")),
    ),
  );
  await assert.rejects(
    lease.invoke({ executable: "node", interactive: true }),
    /Interactive/,
  );
  assert.equal(lease.liveInput, true);
  await lease.release();
  await lease.release();
  assert.equal(stopped, 1);
  await assert.rejects(lease.invoke({ executable: "node" }), /closed/);
});

test("Daytona contract isolates commands, preserves streams and cancels without deleting sandbox", async (t) => {
  const root = await repository(t),
    files = new Map<string, Buffer>(),
    commands: string[] = [];
  let deleted = 0,
    sessions = 0,
    wait = false;
  const sandbox = {
    getUserHomeDir: async () => "/home/test",
    fs: {
      createFolder: async () => {},
      uploadFile: async (data: Buffer, path: string) => {
        files.set(path, data);
      },
      downloadFile: async (path: string) => files.get(path)!,
    },
    process: {
      createSession: async () => {
        sessions++;
      },
      deleteSession: async () => {
        sessions--;
      },
      executeCommand: async (script: string) => {
        commands.push(script);
        return {
          exitCode: 0,
          result: JSON.stringify([{ path: "", kind: "file", mode: 420 }]),
        };
      },
      executeSessionCommand: async (
        _id: string,
        options: { command: string },
      ) => {
        commands.push(options.command);
        return { cmdId: "command" };
      },
      getSessionCommandLogs: async (
        _id: string,
        _cmd: string,
        stdout: (chunk: string) => void,
        stderr: (chunk: string) => void,
      ) => {
        stdout("full-output");
        stderr("stderr");
        if (wait) await new Promise(() => {});
      },
      getSessionCommand: async () => ({ exitCode: 0 }),
    },
  };
  const connect = async () =>
    ({
      create: async () => sandbox,
      delete: async () => {
        deleted++;
      },
    }) as unknown as Pick<Daytona, "create" | "delete">;
  const lease = await createDaytonaSandboxProvider(
    { retain: 4 },
    connect,
  ).acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: { SECRET: "value with 'quote" },
  });
  assert.deepEqual(await lease.invoke({ executable: "node", stdin: "hello" }), {
    status: 0,
    stdout: "tput",
    stderr: "derr",
  });
  assert.equal(sessions, 0);
  assert.ok(commands.every((command) => !command.includes("value with")));
  assert.ok(
    [...files.values()].some((bytes) =>
      bytes.toString().includes("value with"),
    ),
  );
  await lease.upload(join(root, "base.txt"), "/remote/base");
  await lease.download("/remote/base", join(root, "download"));
  assert.equal(await readFile(join(root, "download"), "utf8"), "base\n");
  wait = true;
  await assert.rejects(
    lease.invoke({ executable: "sleep", elevated: true, deadlineMs: 20 }),
    /timeout|aborted/i,
  );
  assert.ok(
    commands.some((command) => command.includes("sudo -n -- kill -KILL")),
  );
  assert.ok(
    commands.some(
      (command) => command.includes(".cancel") && command.startsWith("rm -f"),
    ),
  );
  assert.equal(deleted, 0);
  assert.equal(sessions, 0);
  wait = false;
  assert.equal((await lease.invoke({ executable: "true" })).status, 0);
  assert.equal(lease.liveInput, true);
  await lease.release();
  await lease.release();
  assert.equal(deleted, 1);
  await assert.rejects(lease.invoke({ executable: "node" }), /closed/);
});

test("cloud transfers preserve directories and refuse manifest traversal", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    target = join(root, "target"),
    uploaded = new Map<string, Buffer>();
  await mkdir(join(source, "empty"), { recursive: true });
  await mkdir(join(source, ".git"));
  await writeFile(join(source, ".git", "config"), "dependency checkout");
  await writeFile(join(source, "file.txt"), "contents");
  const directories: string[] = [];
  await uploadTree(
    source,
    "/input",
    async (path, data) => {
      uploaded.set(path, data);
    },
    async () => {},
    async (path, isDirectory) => {
      if (isDirectory) directories.push(path);
    },
  );
  assert.ok(directories.includes("/input/empty"));
  const listing = await executeProcess({
    executable: process.execPath,
    arguments: ["-e", manifestScript, source],
  });
  await downloadTree("/input", target, listing.stdout, async (path) =>
    uploaded.get(path)!,
  );
  assert.equal(await readFile(join(target, "file.txt"), "utf8"), "contents");
  assert.equal(
    await readFile(join(target, ".git", "config"), "utf8"),
    "dependency checkout",
  );
  await assert.rejects(
    downloadTree(
      "/input",
      target,
      JSON.stringify([{ path: "../escape", kind: "file", mode: 420 }]),
      async () => Buffer.from(""),
    ),
    /Unsafe/,
  );
  await assert.rejects(
    downloadTree("/input", target, "{}", async () => Buffer.from("")),
    /manifest/,
  );
});

test("cloud live input transfers large frames and reports append failures without killing the turn", async (t) => {
  const root = await repository(t);
  for (const name of ["vercel", "daytona"] as const) {
    for (const mode of [
      "success",
      "managed-failure",
      "direct-failure",
    ] as const) {
      const files = new Map<string, Buffer>();
      const lines: string[] = [];
      const scripts: string[] = [];
      let ended!: () => void;
      const finished = new Promise<void>((resolve) => (ended = resolve));
      let killed = 0;
      let failed!: () => void;
      const failure = new Promise<void>((resolve) => (failed = resolve));
      const storeFile = (path: string, data: Buffer) => {
        files.set(path, data);
        if (path.endsWith(".closed")) ended();
      };
      const append = (script: string) => {
        assert.ok(script.length < 10_000, "input must not be embedded in argv");
        if (script.includes("kill -KILL")) killed++;
        const path = /^cat '([^']+)' >> /.exec(script)?.[1];
        if (!path) return;
        if (mode !== "success") {
          failed();
          throw new Error("append disconnected");
        }
        lines.push(files.get(path)!.toString());
      };
      const lease =
        name === "vercel"
          ? await createVercelSandboxProvider(
              {},
              async () =>
                ({
                  mkDir: async () => {},
                  stop: async () => {},
                  writeFiles: async (
                    entries: { path: string; content: Buffer }[],
                  ) => {
                    for (const item of entries)
                      storeFile(item.path, item.content);
                  },
                  runCommand: async (
                    input: string | { cmd: string; args: string[] },
                    args?: string[],
                  ) => {
                    if (typeof input === "string") {
                      append(args?.[1] ?? "");
                      return {
                        exitCode: 0,
                        stdout: async () => "/home/test\n",
                      };
                    }
                    scripts.push([input.cmd, ...input.args].join(" "));
                    return {
                      async *logs() {
                        await finished;
                        yield { stream: "stdout", data: "done" };
                      },
                      wait: async () => ({ exitCode: 7 }),
                      kill: async () => {
                        killed++;
                      },
                    };
                  },
                }) as unknown as VercelSandbox,
            ).acquire({
              repository: root,
              directory: root,
              gitDirectories: [],
              variables: {},
            })
          : await createDaytonaSandboxProvider(
              {},
              async () =>
                ({
                  create: async () => ({
                    getUserHomeDir: async () => "/home/test",
                    fs: {
                      createFolder: async () => {},
                      uploadFile: async (data: Buffer, path: string) => {
                        storeFile(path, data);
                      },
                    },
                    process: {
                      createSession: async () => {},
                      deleteSession: async () => {},
                      executeCommand: async (script: string) => {
                        append(script);
                        return { exitCode: 0, result: "" };
                      },
                      executeSessionCommand: async (
                        _id: string,
                        options: { command: string },
                      ) => {
                        scripts.push(options.command);
                        return { cmdId: "command" };
                      },
                      getSessionCommandLogs: async (
                        _id: string,
                        _cmd: string,
                        stdout: (chunk: string) => void,
                      ) => {
                        await finished;
                        stdout("done");
                      },
                      getSessionCommand: async () => ({ exitCode: 7 }),
                    },
                  }),
                  delete: async () => {},
                }) as unknown as Pick<Daytona, "create" | "delete">,
            ).acquire({
              repository: root,
              directory: root,
              gitDirectories: [],
              variables: {},
            });
      try {
        assert.equal(lease.liveInput, true);
        const input = new PassThrough();
        const failures: OutpostError[] = [];
        const unobserve =
          mode === "managed-failure"
            ? observeInputFailure(input, (error) => failures.push(error))
            : () => {};
        const pending = lease.invoke({
          executable: "claude",
          arguments: ["--print"],
          stdin: "prompt\n",
          input,
        });
        const payload = "steer".repeat(30_000) + "\n";
        input.write(payload);
        if (mode !== "success") {
          await failure;
          await new Promise((resolve) => setImmediate(resolve));
          assert.equal(killed, 0, name);
        }
        input.end();
        if (mode === "direct-failure")
          await assert.rejects(
            pending,
            (error) =>
              error instanceof OutpostError && error.code === "steering",
          );
        else assert.equal((await pending).status, 7);
        unobserve();
        assert.equal(killed, 0, name);
        if (mode === "managed-failure")
          assert.equal(failures[0]?.code, "steering");
        if (mode === "success")
          assert.deepEqual(lines, [
            Buffer.from(payload).toString("base64") + "\n",
          ]);
        assert.equal((await lease.invoke({ executable: "true" })).status, 7);
        assert.ok(
          [...files.values()].some(
            (value) =>
              value.toString() ===
              `${Buffer.from("prompt\n").toString("base64")}\n`,
          ),
          name,
        );
        const script = scripts[0]!;
        assert.ok(script.includes("fs.readFileSync(file)"), name);
        assert.ok(
          script.indexOf("claude") > script.indexOf("readFileSync"),
          name,
        );
        assert.doesNotMatch(script, / < /);
      } finally {
        await lease.release();
      }
    }
  }
});
