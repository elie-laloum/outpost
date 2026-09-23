import { mkdir } from "node:fs/promises";
import { dirname, posix } from "node:path";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { ContainerRuntime } from "./container.types.ts";

export function containerFiles(
  call: ContainerRuntime["call"],
  name: string,
): Pick<SandboxLease, "upload" | "download"> {
  return {
    async upload(source, destination, options = {}) {
      options.signal?.throwIfAborted();
      await call(
        ["exec", name, "mkdir", "-p", posix.dirname(destination)],
        options,
      );
      await call(["cp", source, `${name}:${destination}`], options);
    },
    async download(source, destination, options = {}) {
      options.signal?.throwIfAborted();
      await mkdir(dirname(destination), { recursive: true });
      await call(["cp", `${name}:${source}`, destination], options);
    },
  };
}
