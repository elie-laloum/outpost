import { chmod } from "node:fs/promises";
import { Readable, Writable } from "node:stream";
import { posix } from "node:path";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { binaryExecutor } from "../infrastructure/binary-process.ts";
import { transferDestination } from "../infrastructure/transfer-copy.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { transfer } from "../infrastructure/transfer.ts";
import { downloadTree, uploadTree } from "./cloud-files.ts";
import { manifestScript } from "./cloud-files.constants.ts";
import { firecrackerCommand } from "./firecracker-command.ts";
import { firecrackerDefaults } from "./firecracker.constants.ts";
import { firecrackerFileScript } from "./firecracker-files.constants.ts";
import type { FirecrackerRuntime } from "./firecracker.types.ts";

export function firecrackerFiles(
  runtime: FirecrackerRuntime,
): Pick<SandboxLease, "upload" | "download"> {
  const invoke = firecrackerCommand(runtime);
  const run = async (args: string[], signal: AbortSignal) => {
    const result = await invoke({
      executable: "node",
      arguments: ["-e", firecrackerFileScript, ...args],
      signal,
    });
    if (result.status !== 0)
      throw new OutpostError("provider", "Guest file operation failed", {
        stderr: result.stderr,
      });
  };
  return {
    upload(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        const modes: [string, number][] = [];
        await uploadTree(
          source,
          posix.resolve(runtime.root, destination),
          async (path, data) => {
            await firecrackerCommand({
              ...runtime,
              executor: binaryExecutor({ input: Readable.from([data]) }),
            })({
              executable: "node",
              arguments: ["-e", firecrackerFileScript, "write", path],
              signal,
            });
          },
          (target, path) => run(["link", path, target], signal),
          async (path, directory, mode) => {
            if (directory) {
              await run(["directory", path], signal);
              modes.push([path, mode]);
              return;
            }
            await run(["mode", path, String(mode)], signal);
          },
          signal,
        );
        for (const [path, mode] of modes.reverse())
          await run(["mode", path, String(mode)], signal);
      });
    },
    download(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        await transferDestination(destination);
        const remote = posix.resolve(runtime.root, source);
        const manifest = await invoke({
          executable: "node",
          arguments: ["-e", manifestScript, remote],
          retain: firecrackerDefaults.manifestBytes,
          signal,
        });
        if (manifest.status !== 0)
          throw new OutpostError("provider", "Guest manifest failed", {
            stderr: manifest.stderr,
          });
        await downloadTree(
          remote,
          destination,
          manifest.stdout,
          async (path) => {
            const chunks: Buffer[] = [];
            const output = new Writable({
              write(chunk: Buffer, _encoding, done) {
                chunks.push(chunk);
                done();
              },
            });
            await firecrackerCommand({
              ...runtime,
              executor: binaryExecutor({ output }),
            })({
              executable: "node",
              arguments: ["-e", firecrackerFileScript, "read", path],
              signal,
            });
            return Buffer.concat(chunks);
          },
          signal,
        );
        const entries: unknown = JSON.parse(manifest.stdout);
        if (!Array.isArray(entries))
          throw new OutpostError("provider", "Invalid transfer manifest");
        const records: unknown[] = entries;
        for (const entry of records.reverse()) {
          if (
            !entry ||
            typeof entry !== "object" ||
            !("kind" in entry) ||
            !("path" in entry) ||
            typeof entry.path !== "string" ||
            !("mode" in entry) ||
            typeof entry.mode !== "number" ||
            !Number.isSafeInteger(entry.mode)
          )
            throw new OutpostError("provider", "Invalid transfer entry");
          if (entry.kind !== "directory") continue;
          signal.throwIfAborted();
          const path = entry.path
            ? await safeDestination(destination, entry.path)
            : destination;
          await chmod(path, entry.mode & 0o777);
        }
      });
    },
  };
}
