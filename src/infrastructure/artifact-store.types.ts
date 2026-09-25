import type { Transport } from "../domain/transport.types.ts";

export interface FileArtifactStoreOptions {
  readonly directory?: string;
  readonly transporter?: Transport;
  readonly maxBytes?: number;
}
