import type { Transport } from "../domain/transport.types.ts";

export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory?: string;
  readonly transporter?: Transport;
}
