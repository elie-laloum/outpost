import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { Sandbox } from "@vercel/sandbox";
import type { Daytona } from "@daytona/sdk";
import type { CommandResult } from "../../src/domain/command.types.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import type { CloudDependencyCache } from "../../src/providers/cloud-cache.types.ts";

export async function cloudCacheSandbox(
  name: "vercel" | "daytona",
  directory: string,
  caches: readonly CloudDependencyCache[],
  environment = "v1",
  stop: () => Promise<void> = async () => {},
  retain = 65536,
) {
  const home = join(directory, "home");
  const root = join(directory, "workspace");
  await mkdir(home, { recursive: true });
  await mkdir(root, { recursive: true });
  const bin = join(directory, "bin");
  await mkdir(bin);
  await writeFile(join(bin, "sudo"), '#!/bin/sh\nshift 2\nexec "$@"\n', {
    mode: 0o700,
  });
  await writeFile(
    join(bin, "setsid"),
    '#!/bin/sh\n[ "$1" = "--wait" ] || exit 64\nshift\nexec "$@"\n',
    { mode: 0o700 },
  );
  const path = (value: string) =>
    value.replaceAll("/outpost/cache", join(directory, "cache"));
  const execute = async (
    cmd: string,
    args: readonly string[],
    cwd = root,
    signal?: AbortSignal,
  ) =>
    executeProcess({
      executable: cmd,
      arguments: args.map(path),
      variables: { PATH: `${bin}:${process.env.PATH}` },
      directory: cwd,
      ...(signal ? { signal } : {}),
    });
  const folder = (value: string) => mkdir(path(value), { recursive: true });
  const write = (value: string, bytes: Buffer) => writeFile(path(value), bytes);
  const read = (value: string) => readFile(path(value));
  const sandbox = {
    mkDir: folder,
    stop,
    runCommand: async (
      input:
        | string
        | { cmd: string; args: string[]; cwd: string; signal: AbortSignal },
      args: string[] = [],
    ) => {
      if (input === "printenv")
        return { exitCode: 0, stdout: async () => home };
      if (typeof input === "string") {
        const result = await execute(input, args);
        return {
          exitCode: result.status,
          stdout: async () => result.stdout,
          stderr: async () => result.stderr,
        };
      }
      const result = await execute(
        input.cmd,
        input.args,
        input.cwd,
        input.signal,
      );
      return {
        async *logs() {
          yield { stream: "stdout", data: result.stdout };
          yield { stream: "stderr", data: result.stderr };
        },
        wait: async () => ({ exitCode: result.status }),
        kill: async () => {},
      };
    },
    writeFiles: async (entries: { path: string; content: Buffer }[]) => {
      for (const entry of entries) await write(entry.path, entry.content);
    },
    readFile: async ({ path }: { path: string }) =>
      Readable.from([await read(path)]),
  };
  if (name === "vercel")
    return createVercelSandboxProvider(
      {
        root,
        create: {
          source: { type: "snapshot", snapshotId: environment },
        },
        caches,
        retain,
      },
      async () => sandbox as unknown as Sandbox,
    );
  const results = new Map<string, CommandResult>();
  return createDaytonaSandboxProvider(
    { root, create: { snapshot: environment }, caches, retain },
    async () =>
      ({
        create: async () => ({
          getUserHomeDir: async () => home,
          fs: {
            createFolder: folder,
            uploadFile: (bytes: Buffer, value: string) => write(value, bytes),
            downloadFile: read,
          },
          process: {
            createSession: async () => {},
            deleteSession: async () => {},
            executeCommand: async (script: string) => {
              const result = await execute("sh", ["-c", script]);
              return { exitCode: result.status, result: result.stdout };
            },
            executeSessionCommand: async (
              id: string,
              options: { command: string },
            ) => {
              results.set(
                id,
                await execute("sh", [
                  "-c",
                  options.command.replaceAll("sudo -n -- ", ""),
                ]),
              );
              return { cmdId: id };
            },
            getSessionCommandLogs: async (
              id: string,
              _cmd: string,
              stdout: (text: string) => void,
              stderr: (text: string) => void,
            ) => {
              stdout(results.get(id)!.stdout);
              stderr(results.get(id)!.stderr);
            },
            getSessionCommand: async (id: string) => ({
              exitCode: results.get(id)!.status,
            }),
          },
        }),
        delete: stop,
      }) as unknown as Pick<Daytona, "create" | "delete">,
  );
}
