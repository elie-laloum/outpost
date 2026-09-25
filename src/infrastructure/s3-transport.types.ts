import type { S3Client } from "@aws-sdk/client-s3";

export interface S3TransportOptions {
  readonly client: S3Client;
  readonly bucket: string;
  readonly prefix?: string;
}
