import { invariant } from "../domain/errors.ts";
import { warmConfigurationKeys } from "./lifecycle.constants.ts";
import type { SandboxOptions } from "./outpost.types.ts";

export function continuationConfiguration<T extends SandboxOptions>(
  configuration: T,
  next: SandboxOptions,
): T {
  if (next.repository || next.branch || next.copies) {
    const { workspace, ...rest } = configuration;
    return {
      ...(workspace ? { repository: workspace.repository } : {}),
      ...rest,
    } as T;
  }
  return configuration;
}

export function warmContinuation(options: object): void {
  invariant(
    !warmConfigurationKeys.some((key) => key in options),
    "Warm continuation uses its existing sandbox; use dispatch() to change sandbox settings",
  );
}
