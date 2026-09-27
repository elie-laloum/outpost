import type { S3TransportOptions } from "../../src/infrastructure/s3-transport.types.ts";

export interface S3FixtureOptions {
  readonly deleteMode?: S3TransportOptions["deleteMode"];
  readonly ignoreDeleteCondition?: boolean;
}

export interface S3FixtureObject {
  bytes: Buffer;
  etag: string;
  date: Date;
  tombstone?: boolean;
}
