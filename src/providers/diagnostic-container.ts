import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { containerProvider } from "./container.ts";
import type { ContainerEngine } from "./container.types.ts";

export function diagnosticContainer(
  engine: ContainerEngine,
  image: string,
  deadlineMs: number,
  execute: Executor = executeProcess,
): SandboxProvider {
  return containerProvider(engine, { image, networks: "none" }, (command) => {
    const args = command.arguments ?? [];
    return execute({
      ...command,
      deadlineMs: Math.min(command.deadlineMs ?? deadlineMs, deadlineMs),
      arguments:
        args[0] === "create"
          ? ["create", "--pull=never", ...args.slice(1)]
          : args,
    });
  });
}
