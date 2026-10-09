import type { Transport, TransportReference } from "./transport.types.ts";
import type { BranchPolicy, Disposal } from "./workspace.types.ts";
import type { DiffGuard } from "./diff-guard.types.ts";

export interface GitWorkspaceSource {
  readonly kind: "git";
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly guard?: DiffGuard;
}

export type FileWorkspaceSource =
  | {
      readonly kind: "directory";
      readonly directory: string;
      readonly access:
        | { readonly mode: "copy" }
        | {
            readonly mode: "mount";
            readonly target: string;
            readonly readOnly: boolean;
          };
    }
  | { readonly kind: "ephemeral" };

export type WorkspaceSource = GitWorkspaceSource | FileWorkspaceSource;

export interface WorkspaceRuntimeOptions {
  readonly directory?: string;
  readonly namespace?: string;
}

export interface WorkspaceRuntime {
  readonly directory: string;
  readonly namespace: string;
}

export type WorkspaceRetention =
  | { readonly policy: "run" | "local" }
  | { readonly policy: "portable"; readonly transporter: Transport };

export type WorkspaceInput =
  | { readonly directory: string; readonly paths?: readonly string[] }
  | { readonly snapshot: TransportReference; readonly transporter: Transport };

export interface WorkspaceSession {
  readonly id: string;
  readonly kind: "git" | "directory" | "ephemeral";
  readonly directory: string;
  readonly runtime: WorkspaceRuntime;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}

export interface WorkspaceFileEntry {
  readonly path: string;
  readonly kind: "file" | "link" | "directory";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
  readonly target?: string;
}

export interface FileWorkspaceRecord {
  readonly format: 1;
  readonly id: string;
  readonly kind: "directory" | "ephemeral";
  readonly source: FileWorkspaceSource;
  readonly ownership: "owned";
  readonly owner: {
    readonly nonce: string;
    readonly state: "open" | "released" | "recovering";
  };
  readonly locks: {
    readonly materialization: string;
    readonly source?: string;
  };
  readonly materialization: { readonly device: number; readonly inode: number };
  readonly directory: string;
  readonly runtime: WorkspaceRuntime;
  readonly inputFingerprint: string;
  readonly preparation?: "preparing" | "failed" | "ready";
  readonly inputs?: readonly WorkspaceFileEntry[];
  readonly publicationBaselines?: readonly {
    readonly options: WorkspaceOutputOptions;
    readonly expected: readonly WorkspaceFileEntry[];
  }[];
  readonly publications?: readonly {
    readonly id: string;
    readonly state: "applying" | WorkspacePublication["state"];
    readonly reference: TransportReference;
  }[];
  readonly mountedFingerprint?: string;
  readonly generation: number;
  readonly fingerprint: string;
  readonly snapshot?: TransportReference;
  readonly conversations?: readonly WorkspaceConversationArchive[];
  readonly allocation?: WorkspaceAllocationRecord;
}

export interface WorkspaceAllocationRecord {
  readonly provider: string;
  readonly state: "allocating" | "active" | "uncertain" | "released";
  readonly resourceId?: string;
  readonly reference: TransportReference;
}

export interface WorkspaceConversationArchive {
  readonly id: string;
  readonly format: string;
  readonly path: string;
  readonly archive: TransportReference;
}

export interface WorkspaceOutputOptions {
  readonly paths: readonly string[];
  readonly destination: string;
  readonly policy: "create" | "update";
  readonly deleteMissing?: boolean;
}

export interface WorkspaceOutputBaseline {
  readonly options: WorkspaceOutputOptions;
  readonly expected: readonly WorkspaceFileEntry[];
}

export interface WorkspacePublication {
  readonly id: string;
  readonly destination: string;
  readonly state: "complete" | "rolled-back" | "recovery-required";
  readonly created: readonly string[];
  readonly replaced: readonly string[];
  readonly deleted: readonly string[];
  readonly reference: TransportReference;
}
