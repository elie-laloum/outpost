import type { Channel } from "../domain/command.types.ts";

export interface SupervisedCommand {
  readonly executable: string;
  readonly arguments: readonly string[];
  readonly directory: string;
  readonly output: (channel: Channel, text: string) => void;
}

export interface SupervisedExit {
  /** Exit code, or null when a signal ended the process. */
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
}

/** A long-running child process stopped by request rather than by deadline. */
export interface SupervisedProcess {
  readonly exited: Promise<SupervisedExit>;
  /** Asks the process to stop and clean up; a second call kills it. */
  stop(): void;
}
