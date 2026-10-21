import type { createAgentConversationIndex } from "./agent-conversation-index.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { FileSandboxOptions } from "./file-sandbox.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceState,
} from "./file-workspace.types.ts";
import type { operationGate } from "./operation-gate.ts";

export interface FileSandboxSynchronizationContext {
  readonly options: FileSandboxOptions;
  readonly workspace: FileWorkspace;
  readonly state: FileWorkspaceState;
  readonly lease: SandboxLease;
  readonly staging: string;
}

export interface FileSandboxAttachmentContext extends FileSandboxSynchronizationContext {
  readonly conversationHome: string;
  readonly signal: AbortSignal;
  readonly gate: ReturnType<typeof operationGate>;
  readonly known: ReturnType<typeof createAgentConversationIndex>;
  settled<T>(action: () => Promise<T>, signal?: AbortSignal): Promise<T>;
}
