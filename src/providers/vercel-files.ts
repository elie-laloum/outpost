import { posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { transfer } from "../infrastructure/transfer.ts";
import { manifestScript } from "./cloud-files.constants.ts";
import { downloadTree, uploadTree } from "./cloud-files.ts";
import { vercelDirectory } from "./vercel-directory.ts";
import type { VercelRuntime } from "./vercel.types.ts";

export function vercelFiles(
  sandbox: VercelRuntime["sandbox"],
): Pick<SandboxLease, "upload" | "download"> {
  return {
    async upload(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        await uploadTree(
          source,
          destination,
          (path, content) => sandbox.writeFiles([{ path, content }]),
          async (target, path) => {
            await vercelDirectory(sandbox, posix.dirname(path));
            const result = await sandbox.runCommand("ln", [
              "-s",
              "--",
              target,
              path,
            ]);
            if (result.exitCode !== 0)
              throw new OutpostError("provider", "Symlink upload failed");
          },
          async (path, directory, mode) => {
            if (directory) await vercelDirectory(sandbox, path);
            const result = await sandbox.runCommand("chmod", [
              mode.toString(8),
              path,
            ]);
            if (result.exitCode !== 0)
              throw new OutpostError(
                "provider",
                "Transfer permissions could not be set",
              );
          },
          signal,
        );
      });
    },
    async download(source, destination, options = {}) {
      return transfer(options, async (signal) => {
        const listing = await sandbox.runCommand("node", [
          "-e",
          manifestScript,
          source,
        ]);
        if (listing.exitCode !== 0)
          throw new OutpostError(
            "provider",
            "Remote transfer source is unavailable",
          );
        await downloadTree(
          source,
          destination,
          await listing.stdout(),
          async (path) => {
            const stream = await sandbox.readFile({ path });
            if (!stream)
              throw new OutpostError(
                "provider",
                `Remote file is missing: ${path}`,
              );
            const chunks: Buffer[] = [];
            for await (const chunk of stream)
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            return Buffer.concat(chunks);
          },
          signal,
        );
      });
    },
  };
}
