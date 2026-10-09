---
title: "FileWorkspaceRecord"
description: "FileWorkspaceRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                   | Type                                                                                                                                                    | Presence | Meaning                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`               | `1`                                                                                                                                                     | Required | Version of the persisted envelope; unsupported versions are refused.                                                                                                                                         |
| `id`                   | `string`                                                                                                                                                | Required | Stable identifier of this resource, independent of its materialization path.                                                                                                                                 |
| `kind`                 | `"ephemeral" \| "directory"`                                                                                                                            | Required | Discriminant selecting Git, a directory source or an initially empty workspace.                                                                                                                              |
| `source`               | `FileWorkspaceSource`                                                                                                                                   | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                                                                                  |
| `ownership`            | `"owned"`                                                                                                                                               | Required | Owned materializations may be cleaned up; borrowed mounted sources are never deleted.                                                                                                                        |
| `owner`                | `{ readonly nonce: string; readonly state: "open" \| "released" \| "recovering"; }`                                                                     | Required | Owner nonce and lifecycle state used to fence resume and explicit recovery.                                                                                                                                  |
| `locks`                | `{ readonly materialization: string; readonly source?: string; }`                                                                                       | Required | Exact host lock identifiers for materialization and mounted source; recovery releases only these locks.                                                                                                      |
| `materialization`      | `{ readonly device: number; readonly inode: number; }`                                                                                                  | Required | Device and inode identity used to detect replacement and known filesystem aliases.                                                                                                                           |
| `directory`            | `string`                                                                                                                                                | Required | Absolute local materialization or source directory; it is not a portable resource identity.                                                                                                                  |
| `runtime`              | `WorkspaceRuntime`                                                                                                                                      | Required | Control directory and logical namespace, separate from the workspace files.                                                                                                                                  |
| `inputFingerprint`     | `string`                                                                                                                                                | Required | Canonical fingerprint of initial inputs and their declared selection, independent of later work.                                                                                                             |
| `preparation`          | `"failed" \| "preparing" \| "ready" \| undefined`                                                                                                       | Optional | Preparation state recorded before file copies and hooks. Incomplete or failed preparation retains files and requires explicit adoption during recovery; absent means a ready record from the earlier format. |
| `inputs`               | `readonly WorkspaceFileEntry[] \| undefined`                                                                                                            | Optional | Verified initial manifest retained to detect input identity and protect publication back to the copied source.                                                                                               |
| `publicationBaselines` | `readonly { readonly options: WorkspaceOutputOptions; readonly expected: readonly WorkspaceFileEntry[]; }[] \| undefined`                               | Optional | Declared destinations and their expected pre-execution manifests, retained across resume.                                                                                                                    |
| `publications`         | `readonly { readonly id: string; readonly state: "applying" \| WorkspacePublication["state"]; readonly reference: TransportReference; }[] \| undefined` | Optional | Publication states and Transport journal references, retained independently of workflow task status.                                                                                                         |
| `mountedFingerprint`   | `string \| undefined`                                                                                                                                   | Optional | Fingerprint of the exposed mounted source; a changed or unavailable source refuses resume.                                                                                                                   |
| `generation`           | `number`                                                                                                                                                | Required | Monotonically increasing number recorded only after a settled file generation is verified.                                                                                                                   |
| `fingerprint`          | `string`                                                                                                                                                | Required | Canonical digest of the last verified settled file generation.                                                                                                                                               |
| `snapshot`             | `TransportReference \| undefined`                                                                                                                       | Optional | Transport reference to a verified file snapshot; restoration does not imply sandbox disposal.                                                                                                                |
| `conversations`        | `readonly WorkspaceConversationArchive[] \| undefined`                                                                                                  | Optional | Archived native conversation references relocated with the restored owned workspace.                                                                                                                         |
| `allocation`           | `WorkspaceAllocationRecord \| undefined`                                                                                                                | Optional | Sandbox allocation state, including uncertain allocations that require explicit release evidence.                                                                                                            |

## Signature

```ts
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
  readonly materialization: {
    readonly device: number;
    readonly inode: number;
  };
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
```

## Related contracts

- [FileWorkspaceSource](../fileworkspacesource/)
- [TransportReference](../transportreference/)
- [WorkspaceAllocationRecord](../workspaceallocationrecord/)
- [WorkspaceConversationArchive](../workspaceconversationarchive/)
- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
- [WorkspaceRuntime](../workspaceruntime/)
