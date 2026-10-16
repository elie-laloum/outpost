import { basename, resolve } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import type { SandboxLease, TransferOptions } from "../domain/sandbox.types.ts";
import { inside } from "../infrastructure/files.ts";
import {
  copyTransfer,
  transferDestination,
  transferTarget,
} from "../infrastructure/transfer-copy.ts";
import { transfer } from "../infrastructure/transfer.ts";

export function localFiles(
  root: string,
  isClosed: () => boolean,
): Pick<SandboxLease, "upload" | "download"> {
  const copy = (
    source: string,
    destination: string,
    contents: boolean,
    options: TransferOptions,
  ) =>
    transfer(options, async (signal) => {
      if (isClosed())
        throw new OutpostError("provider", "Local sandbox is closed");
      await transferDestination(destination);
      if (source === destination) return;
      const target = await transferTarget(
        basename(source),
        destination,
        contents,
      );
      if (source === target) return;
      invariant(!inside(source, target), "Cannot copy a directory into itself");
      await copyTransfer(source, target, signal);
    });
  return {
    upload: (source, destination, options = {}) =>
      copy(
        resolve(source),
        resolve(root, destination),
        /[\\/]\.$/.test(source),
        options,
      ),
    download: (source, destination, options = {}) =>
      copy(
        resolve(root, source),
        resolve(destination),
        /[\\/]\.$/.test(source),
        options,
      ),
  };
}
