import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import type { Daytona } from "@daytona/sdk";
import type { CommandResult } from "../../src/domain/command.types.ts";
import { daytonaSandboxProvider } from "../../src/providers/daytona.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test(
  "Daytona preserves the session shell that records completion after streams close",
  { skip: process.platform !== "linux" },
  async (t) => {
    const directory = await repository(t);
    let output: CommandResult | undefined;
    let status: number | undefined;
    let sessions = 0;
    const sandbox = {
      getUserHomeDir: async () => directory,
      fs: {
        createFolder: async (path: string) => {
          await mkdir(path, { recursive: true });
        },
      },
      process: {
        createSession: async () => {
          sessions++;
        },
        deleteSession: async () => {
          sessions--;
        },
        executeCommand: async (command: string) =>
          executeProcess({ executable: "sh", arguments: ["-c", command] }),
        executeSessionCommand: async (
          _id: string,
          request: { command: string },
        ) => {
          output = await executeProcess({
            executable: "sh",
            arguments: [
              "-c",
              `${request.command}\nstatus=$?\nprintf '\\nSESSION_EXIT=%s\\n' "$status"`,
            ],
            deadlineMs: 5000,
          });
          const match = /\nSESSION_EXIT=(\d+)\n$/.exec(output.stdout);
          status = match ? Number(match[1]) : undefined;
          return { cmdId: "command" };
        },
        getSessionCommandLogs: async (
          _id: string,
          _cmd: string,
          stdout: (chunk: string) => void,
          stderr: (chunk: string) => void,
        ) => {
          const text = output!.stdout.replace(/\nSESSION_EXIT=\d+\n$/, "");
          stdout(text && !text.endsWith("\n") ? text + "\n" : text);
          const warning = output!.stderr;
          stderr(warning && !warning.endsWith("\n") ? warning + "\n" : warning);
        },
        getSessionCommand: async () => ({ exitCode: status }),
      },
    };
    const lease = await daytonaSandboxProvider(
      {},
      async () =>
        ({
          create: async () => sandbox,
          delete: async () => {},
        }) as unknown as Pick<Daytona, "create" | "delete">,
    ).acquire({
      repository: directory,
      directory,
      gitDirectories: [],
      variables: {},
    });
    try {
      const result = await lease.invoke({
        executable: process.execPath,
        arguments: [
          "-e",
          "const fs=require('node:fs'); console.log('before-close'); fs.closeSync(1); fs.closeSync(2); setTimeout(()=>process.exit(17),150)",
        ],
        deadlineMs: 1500,
      });
      assert.deepEqual(result, {
        status: 17,
        stdout: "before-close\n",
        stderr: "",
      });
      assert.equal(sessions, 0);
      assert.equal(
        (await lease.invoke({ executable: "true", deadlineMs: 1500 })).status,
        0,
      );
      assert.equal(sessions, 0);
      for (const text of ["path\0", "no newline", "line\n\n", "\n", "é🐱\0"]) {
        const observed = { stdout: "", stderr: "" };
        const streamed = await lease.invoke({
          executable: process.execPath,
          arguments: [
            "-e",
            'const data=Buffer.from(process.argv[1],"base64");process.stdout.write(data);process.stderr.write(data);process.exitCode=7',
            Buffer.from(text).toString("base64"),
          ],
          deadlineMs: 3000,
          observe(channel, chunk) {
            observed[channel] += chunk;
          },
        });
        assert.deepEqual(streamed, { status: 7, stdout: text, stderr: text });
        assert.deepEqual(observed, { stdout: text, stderr: text });
      }
      const missing = await lease.invoke({
        executable: "/outpost-missing-executable",
        deadlineMs: 3000,
      });
      assert.equal(missing.status, 127);
      assert.match(missing.stderr, /ENOENT/);
      const terminated = await lease.invoke({
        executable: process.execPath,
        arguments: ["-e", 'process.kill(process.pid,"SIGTERM")'],
        deadlineMs: 3000,
      });
      assert.equal(terminated.status, 143);
    } finally {
      await lease.release();
    }
  },
);
