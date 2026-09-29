export interface CronOptions {
  /** IANA time zone evaluating the expression; defaults to UTC. */
  readonly timeZone?: string;
}

export interface CronSchedule {
  readonly expression: string;
  readonly timeZone: string;
  /** First occurrence strictly after `after`. */
  next(after: Date): Date;
  /** Latest occurrence at or before `at`. */
  previous(at: Date): Date;
}

export interface CronField {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly names?: readonly string[];
}

export interface CronPattern {
  readonly minutes: readonly number[];
  readonly hours: readonly number[];
  readonly days: ReadonlySet<number>;
  readonly months: ReadonlySet<number>;
  readonly weekdays: ReadonlySet<number>;
  /** Vixie cron matches either day field when both are restricted. */
  readonly eitherDay: boolean;
}
