import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";

export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | { readonly state: "unregistered" }
  | { readonly state: "skipped" | "unavailable"; readonly reason: string };

export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;

export interface WorkspaceGitInspection {
  readonly complete: boolean;
  readonly workspaces: readonly WorkspaceGitEntry[];
  readonly issues: readonly StorageIssue[];
}
