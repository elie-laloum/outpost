import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix, resolve } from "node:path";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { quote } from "../infrastructure/process.ts";
import {
  copyTransfer,
  removeTransferDirectory,
  transferDestination,
  transferTarget,
} from "../infrastructure/transfer-copy.ts";
import { transfer } from "../infrastructure/transfer.ts";
import { transferDefaults } from "../infrastructure/transfer.constants.ts";
import { containerArchive } from "./container-archive.ts";
import type { ContainerRuntime } from "./container.types.ts";

export function containerFiles(
  runtime: ContainerRuntime,
  archive = containerArchive,
): Pick<SandboxLease, "upload" | "download"> {
  const { call, name } = runtime;
  return {
    upload(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        if (runtime.isClosed())
          throw new OutpostError("provider", "Container sandbox is closed");
        const absolute = resolve(source);
        const target = posix.resolve(runtime.root, destination);
        const scratch = `/tmp/outpost-transfer-${randomUUID()}`;
        const entry = basename(absolute);
        invariant(entry, "Upload a directory's contents using a non-root path");
        const contents = /[\\/]\.$/.test(source);
        await call(["exec", name, "mkdir", "-m", "700", scratch], { signal });
        try {
          await archive(
            runtime,
            {
              executable: "tar",
              deadlineMs: options.deadlineMs ?? transferDefaults.deadlineMs,
              arguments: ["-cf", "-", "-C", dirname(absolute), "--", entry],
            },
            {
              executable: "tar",
              deadlineMs: options.deadlineMs ?? transferDefaults.deadlineMs,
              arguments: [
                "-xpf",
                "-",
                "--ignore-zeros",
                "--no-same-owner",
                "-C",
                scratch,
              ],
            },
            true,
            signal,
          );
          await call(
            [
              "exec",
              name,
              "sh",
              "-c",
              `mkdir -p ${quote(posix.dirname(target))} && cp -a -- ${quote(posix.join(scratch, entry) + (contents ? "/." : ""))} ${quote(target)}`,
            ],
            { signal },
          );
        } finally {
          await call([
            "exec",
            name,
            "sh",
            "-c",
            `chmod -R u+rwX ${quote(scratch)} && rm -rf -- ${quote(scratch)}`,
          ]);
        }
      });
    },
    download(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        if (runtime.isClosed())
          throw new OutpostError("provider", "Container sandbox is closed");
        await transferDestination(destination);
        const absolute = posix.resolve(runtime.root, source);
        const entry = posix.basename(absolute);
        invariant(
          entry,
          "Download a directory's contents using a non-root path",
        );
        const scratch = await mkdtemp(join(tmpdir(), "outpost-transfer-"));
        try {
          await archive(
            runtime,
            {
              executable: "tar",
              deadlineMs: options.deadlineMs ?? transferDefaults.deadlineMs,
              arguments: [
                "-xpf",
                "-",
                "--ignore-zeros",
                "--no-same-owner",
                "-C",
                scratch,
              ],
            },
            {
              executable: "tar",
              deadlineMs: options.deadlineMs ?? transferDefaults.deadlineMs,
              arguments: [
                "-cf",
                "-",
                "-C",
                posix.dirname(absolute),
                "--",
                entry,
              ],
            },
            false,
            signal,
          );
          const target = await transferTarget(
            entry,
            destination,
            source.endsWith("/."),
          );
          await mkdir(dirname(target), { recursive: true });
          await copyTransfer(join(scratch, entry), target, signal);
        } finally {
          await removeTransferDirectory(scratch);
        }
      });
    },
  };
}
