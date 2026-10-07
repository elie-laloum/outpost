export interface RepetitionPolicy {
  readonly window: number;
  readonly maxRepeats: number;
}

export interface StuckInstruction {
  readonly instruction: string;
  readonly maxInterventions?: number;
}

export interface WatchdogOptions {
  readonly repetition: RepetitionPolicy;
  readonly onStuck: "stop" | "warn" | StuckInstruction;
}

export interface StuckEvent {
  readonly kind: "stuck";
  readonly activity: "tool" | "file-change";
  readonly name?: string;
  readonly repeats: number;
  readonly window: number;
  readonly action: "stop" | "warn" | "steer";
}
