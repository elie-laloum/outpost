import { realpath } from "node:fs/promises";
import { isAbsolute, relative, posix } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { SandboxContext } from "../domain/sandbox.types.ts";

function contains(parent: string, child: string): boolean {
  const offset = relative(parent, child);
  return (
    !isAbsolute(offset) &&
    offset !== ".." &&
    !offset.startsWith("../") &&
    !offset.startsWith("..\\")
  );
}

export async function validateIsolatedMount(
  context: SandboxContext,
  source: string,
  target: string,
): Promise<void> {
  const canonical = await realpath(source);
  for (const path of [
    context.repository,
    context.directory,
    ...context.gitDirectories,
  ]) {
    const protectedPath = await realpath(path);
    invariant(
      !contains(canonical, protectedPath) &&
        !contains(protectedPath, canonical),
      "Isolated repository mounts must not expose the host repository, workspace or Git metadata",
    );
  }
  validateIsolatedTarget(target);
}

export function overlapsIsolatedControl(target: string): boolean {
  return ["/outpost", "/tmp"].some((protectedPath) => {
    const offset = posix.relative(protectedPath, target);
    const reverse = posix.relative(target, protectedPath);
    return !(
      (offset === ".." || offset.startsWith("../")) &&
      (reverse === ".." || reverse.startsWith("../"))
    );
  });
}

function validateIsolatedTarget(target: string): void {
  invariant(
    !overlapsIsolatedControl(target),
    "Isolated repository mounts must not overlap workspace or control directories",
  );
}
