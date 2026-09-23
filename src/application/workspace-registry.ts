import type { Workspace } from "./outpost.types.ts";
import type { WorkspaceState } from "./sandbox-session.types.ts";

export const workspaces = new WeakMap<Workspace, WorkspaceState>();
