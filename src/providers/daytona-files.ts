import { posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote } from "../infrastructure/process.ts";
import { transfer } from "../infrastructure/transfer.ts";
import { manifestScript } from "./cloud-files.constants.ts";
import { downloadTree, uploadTree } from "./cloud-files.ts";
import type { DaytonaRuntime } from "./daytona.types.ts";

export function daytonaFiles(
  sandbox: DaytonaRuntime["sandbox"],
): Pick<SandboxLease, "upload" | "download"> {
  return {
    async upload(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        await uploadTree(
          source,
          destination,
          async (path, content) => {
            await sandbox.fs.createFolder(posix.dirname(path), "755");
            await sandbox.fs.uploadFile(content, path);
          },
          async (target, path) => {
            const result = await sandbox.process.executeCommand(
              `mkdir -p ${quote(posix.dirname(path))} && ln -s -- ${quote(target)} ${quote(path)}`,
            );
            if (result.exitCode !== 0)
              throw new OutpostError("provider", "Symlink upload failed");
          },
          async (path, directory, mode) => {
            if (directory)
              await sandbox.fs.createFolder(path, mode.toString(8));
            else {
              const result = await sandbox.process.executeCommand(
                `chmod ${mode.toString(8)} ${quote(path)}`,
              );
              if (result.exitCode !== 0)
                throw new OutpostError(
                  "provider",
                  "Transfer permissions could not be set",
                );
            }
          },
          signal,
        );
      });
    },
    async download(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        const listing = await sandbox.process.executeCommand(
          `node -e ${quote(manifestScript)} ${quote(source)}`,
        );
        if (listing.exitCode !== 0)
          throw new OutpostError(
            "provider",
            "Remote transfer source is unavailable",
          );
        await downloadTree(
          source,
          destination,
          listing.result,
          (path) => sandbox.fs.downloadFile(path),
          signal,
        );
      });
    },
  };
}
