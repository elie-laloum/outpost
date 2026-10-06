import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Daytona } from "@daytona/sdk";
import type { CommandResult } from "../../src/domain/command.types.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import type {
  CloudFileEntry,
  CloudFileRequest,
  DaytonaSessionRequest,
  VercelCommandRequest,
} from "./cloud-repository.types.ts";

export function vercelRepositoryFixture(
  root: string,
  repositoryMode?: "isolated",
) {
  const sandbox = {
    mkDir: (path: string) => mkdir(path, { recursive: true }),
    writeFiles: async (entries: CloudFileEntry[]) => {
      for (const entry of entries) await writeFile(entry.path, entry.content);
    },
    readFile: async ({ path }: CloudFileRequest) =>
      Readable.from([await readFile(path)]),
    runCommand: async (
      input: string | VercelCommandRequest,
      args?: string[],
    ) => {
      const command: VercelCommandRequest =
        typeof input === "string"
          ? { cmd: input, ...(args ? { args } : {}) }
          : input;
      const result = await executeProcess({
        executable: command.cmd,
        arguments: command.args ?? [],
        ...(command.cwd ? { directory: command.cwd } : {}),
        ...(command.env ? { variables: command.env } : {}),
        ...(command.signal ? { signal: command.signal } : {}),
        ...(command.timeoutMs ? { deadlineMs: command.timeoutMs } : {}),
      });
      return {
        exitCode: result.status,
        stdout: async () => result.stdout,
        stderr: async () => result.stderr,
        async *logs() {
          yield { stream: "stdout", data: result.stdout };
          yield { stream: "stderr", data: result.stderr };
        },
        wait: async () => ({ exitCode: result.status }),
        kill: async () => {},
      };
    },
    stop: async () => {},
  };
  return createVercelSandboxProvider(
    { root, ...(repositoryMode ? { repositoryMode } : {}) },
    async () => sandbox as unknown as VercelSandbox,
  );
}

export function daytonaRepositoryFixture(
  root: string,
  repositoryMode?: "isolated",
) {
  const sessions = new Map<string, CommandResult>();
  const run = (command: string) =>
    executeProcess({ executable: "sh", arguments: ["-c", command] });
  const sandbox = {
    getUserHomeDir: async () => root,
    fs: {
      createFolder: (path: string) => mkdir(path, { recursive: true }),
      uploadFile: (data: Buffer, path: string) => writeFile(path, data),
      downloadFile: (path: string) => readFile(path),
    },
    process: {
      createSession: async () => {},
      deleteSession: async (id: string) => {
        sessions.delete(id);
      },
      executeCommand: async (command: string) => {
        const result = await run(command);
        return { exitCode: result.status, result: result.stdout };
      },
      executeSessionCommand: async (
        id: string,
        request: DaytonaSessionRequest,
      ) => {
        sessions.set(id, await run(request.command));
        return { cmdId: id };
      },
      getSessionCommandLogs: async (
        id: string,
        _cmd: string,
        stdout: (chunk: string) => void,
        stderr: (chunk: string) => void,
      ) => {
        const result = sessions.get(id)!;
        stdout(result.stdout);
        stderr(result.stderr);
      },
      getSessionCommand: async (id: string) => ({
        exitCode: sessions.get(id)!.status,
      }),
    },
  };
  return createDaytonaSandboxProvider(
    { root, ...(repositoryMode ? { repositoryMode } : {}) },
    async () =>
      ({
        create: async () => sandbox,
        delete: async () => {},
      }) as unknown as Pick<Daytona, "create" | "delete">,
  );
}
