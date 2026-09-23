export type FaultCode =
  | "configuration"
  | "process"
  | "timeout"
  | "aborted"
  | "workspace"
  | "conflict"
  | "prompt"
  | "response"
  | "session"
  | "provider";

export class OutpostError extends Error {
  readonly code: FaultCode;
  readonly details: Readonly<Record<string, unknown>>;
  constructor(
    code: FaultCode,
    message: string,
    details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "OutpostError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new OutpostError("configuration", message);
}

export function positive(value: number, label: string): number {
  invariant(
    Number.isSafeInteger(value) && value > 0,
    `${label} must be a positive integer`,
  );
  return value;
}
