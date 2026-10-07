import type { CommandResult } from "../domain/command.types.ts";

export interface MemoryCommand extends Partial<CommandResult> {
  readonly executable: string;
  readonly arguments?: readonly string[];
}

export interface MemorySandboxOptions {
  readonly commands?: readonly MemoryCommand[];
}
