import type { Command } from "./command.types.ts";

export interface ChangedCondition {
  readonly kind: "changed";
  readonly files: readonly string[];
}

export interface LifecycleCommand extends Command {
  readonly when?: ChangedCondition;
}
