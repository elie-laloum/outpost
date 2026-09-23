import type { Command, CommandResult } from "../domain/command.types.ts";

export type Executor = (command: Command) => Promise<CommandResult>;
