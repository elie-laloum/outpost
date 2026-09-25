export interface TransportReadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}

export interface TransportWriteOptions {
  readonly signal?: AbortSignal;
  readonly ifRevision: string | null;
}

export interface TransportEntry {
  readonly key: string;
  readonly revision: string;
  readonly size: number;
  readonly modifiedAt: string;
}

export interface TransportObject extends TransportEntry {
  readonly bytes: Uint8Array;
}

export interface Transport {
  readonly name: string;
  read(
    key: string,
    options?: TransportReadOptions,
  ): Promise<TransportObject | undefined>;
  write(
    key: string,
    bytes: Uint8Array,
    options: TransportWriteOptions,
  ): Promise<TransportEntry>;
  remove(key: string, options: TransportWriteOptions): Promise<void>;
  list(
    prefix?: string,
    options?: TransportReadOptions,
  ): AsyncIterable<TransportEntry>;
}

export interface TransportStoreOptions {
  readonly transporter: Transport;
}

export interface TransportReference {
  readonly key: string;
  readonly revision: string;
}
