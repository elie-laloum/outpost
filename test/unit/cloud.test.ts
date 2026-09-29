import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PassThrough, Readable } from "node:stream";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Daytona } from "@daytona/sdk";
import { vercelSandboxProvider } from "../../src/providers/vercel.ts";
import { daytonaSandboxProvider } from "../../src/providers/daytona.ts";
import {
  downloadTree,
  manifestScript,
  uploadTree,
} from "../../src/providers/cloud-files.ts";
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
  const lease = await vercelSandboxProvider(
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
  const lease = await daytonaSandboxProvider({ retain: 4 }, connect).acquire({
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
  await lease.upload(join(root, "base.txt"), "/remote/base");
  await lease.download("/remote/base", join(root, "download"));
  assert.equal(await readFile(join(root, "download"), "utf8"), "base\n");
  wait = true;
  await assert.rejects(
    lease.invoke({ executable: "sleep", deadlineMs: 20 }),
    /timeout|aborted/i,
  );
  assert.ok(commands.some((command) => command.includes("kill -KILL")));
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

function appendedLine(script: string): string | undefined {
  return /^printf '%s' '([A-Za-z0-9+/=]*\n)' >> /.exec(script)?.[1];
}

async function liveInvocation(
  invoke: (input: PassThrough) => Promise<unknown>,
  lines: readonly string[],
): Promise<void> {
  const input = new PassThrough();
  const pending = invoke(input);
  input.write("steer\n");
  input.end();
  await pending;
  assert.deepEqual(lines, [
    `${Buffer.from("steer\n").toString("base64")}\n`,
    "\n",
  ]);
}

test("Vercel and Daytona stage framed stdin and append live input until the end frame", async (t) => {
  const root = await repository(t);
  for (const name of ["vercel", "daytona"] as const) {
    const files = new Map<string, Buffer>();
    const lines: string[] = [];
    const scripts: string[] = [];
    let ended!: () => void;
    const finished = new Promise<void>((resolve) => (ended = resolve));
    const append = (script: string) => {
      const line = appendedLine(script);
      if (line === undefined) return;
      lines.push(line);
      if (line === "\n") ended();
    };
    const lease =
      name === "vercel"
        ? await vercelSandboxProvider(
            {},
            async () =>
              ({
                mkDir: async () => {},
                stop: async () => {},
                writeFiles: async (
                  entries: { path: string; content: Buffer }[],
                ) => {
                  for (const item of entries)
                    files.set(item.path, item.content);
                },
                runCommand: async (
                  input: string | { cmd: string; args: string[] },
                  args?: string[],
                ) => {
                  if (typeof input === "string") {
                    append(args?.[1] ?? "");
                    return { exitCode: 0, stdout: async () => "/home/test\n" };
                  }
                  scripts.push([input.cmd, ...input.args].join(" "));
                  return {
                    async *logs() {
                      await finished;
                      yield { stream: "stdout", data: "done" };
                    },
                    wait: async () => ({ exitCode: 0 }),
                    kill: async () => {},
                  };
                },
              }) as unknown as VercelSandbox,
          ).acquire({
            repository: root,
            directory: root,
            gitDirectories: [],
            variables: {},
          })
        : await daytonaSandboxProvider(
            {},
            async () =>
              ({
                create: async () => ({
                  getUserHomeDir: async () => "/home/test",
                  fs: {
                    createFolder: async () => {},
                    uploadFile: async (data: Buffer, path: string) => {
                      files.set(path, data);
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
                    getSessionCommand: async () => ({ exitCode: 0 }),
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
      await liveInvocation(
        (input) =>
          lease.invoke({
            executable: "claude",
            arguments: ["--print"],
            stdin: "prompt\n",
            input,
          }),
        lines,
      );
      assert.ok(
        [...files.values()].some(
          (value) =>
            value.toString() ===
            `${Buffer.from("prompt\n").toString("base64")}\n`,
        ),
        name,
      );
      const script = scripts.at(-1)!;
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
});
