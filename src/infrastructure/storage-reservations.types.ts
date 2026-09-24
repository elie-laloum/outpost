export interface StorageReservationOptions {
  readonly maxBytes: number;
  readonly reserveBytes: number;
  readonly maxEntries?: number;
  readonly signal?: AbortSignal;
}

export interface StorageReservation {
  readonly id: string;
  readonly repository: string;
  readonly reserveBytes: number;
  release(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

export interface StorageReservationRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: unknown;
  readonly reserveBytes: number;
  readonly createdAt: string;
}
