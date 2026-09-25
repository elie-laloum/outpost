import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import type { Daytona } from "@daytona/sdk";
import type { CommandResult } from "../../src/domain/command.types.ts";
import { daytona } from "../../src/providers/daytona.ts";
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
          stdout(output!.stdout.replace(/\nSESSION_EXIT=\d+\n$/, ""));
          stderr(output!.stderr);
        },
        getSessionCommand: async () => ({ exitCode: status }),
      },
    };
    const lease = await daytona(
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
    } finally {
      await lease.release();
    }
  },
);
