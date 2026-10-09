import type {
  WorkspaceFileEntry,
  WorkspaceOutputOptions,
  WorkspacePublication,
} from "../domain/file-workspace.types.ts";

export interface PublicationOperation {
  readonly path: string;
  readonly previous?: WorkspaceFileEntry;
  readonly incoming?: WorkspaceFileEntry;
  rollbackDisplaced?: string;
  phase:
    | "pending"
    | "quarantine-intent"
    | "quarantined"
    | "install-intent"
    | "installed"
    | "restored";
}

export interface PublicationJournal {
  readonly format: 1;
  readonly id: string;
  readonly workspaceId: string;
  readonly options: WorkspaceOutputOptions;
  readonly staging: string;
  readonly backup: string;
  readonly operations: PublicationOperation[];
  readonly directories?: PublicationDirectory[];
  readonly outputs?: readonly WorkspaceFileEntry[];
  lock?: { readonly id: string; readonly directory: string };
  state: WorkspacePublication["state"] | "applying";
}

export interface PublicationRecoveryOptions {
  readonly processesStopped?: true;
}

export interface PublicationDirectory {
  readonly path: string;
  readonly mode: number;
  identity?: { readonly device: number; readonly inode: number };
  createdMode?: number;
  phase: "pending" | "create-intent" | "created" | "settled" | "restored";
}
