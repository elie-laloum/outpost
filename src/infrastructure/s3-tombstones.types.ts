import type { S3TransportOptions } from "./s3-transport.types.ts";

export interface S3TombstonePruneOptions extends Pick<
  S3TransportOptions,
  "client" | "bucket"
> {
  readonly prefix: string;
  readonly writersStopped: true;
  readonly signal?: AbortSignal;
}
