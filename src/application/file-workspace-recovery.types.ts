import type {
  FileWorkspaceRecord,
  WorkspaceRuntime,
} from "../domain/file-workspace.types.ts";
import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { RestoreFileWorkspaceOptions } from "./file-workspace.types.ts";

export interface FileWorkspaceInspectionOptions {
  readonly runtime: WorkspaceRuntime;
  readonly id: string;
  readonly transporter?: Transport;
}

export interface FileWorkspaceInspection {
  readonly record: FileWorkspaceRecord;
  readonly reference: TransportReference;
}

export interface FileWorkspaceRecoveryOptions extends RestoreFileWorkspaceOptions {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly sandboxProvider?: SandboxProvider;
}
