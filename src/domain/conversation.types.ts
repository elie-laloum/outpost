import type { ObservationHub } from "./observation.types.ts";
import type { TransportReference } from "./transport.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";

export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly reference?: TransportReference;
  readonly format: string;
}

export interface ConversationContext {
  readonly observation?: ObservationHub;
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}

export interface ConversationStore {
  readonly name: string;
  readonly format?: string;
  locate(
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationRecord>;
  capture(
    id: string,
    context: ConversationContext,
  ): Promise<ConversationRecord>;
  restore(
    record: ConversationRecord,
    context: ConversationContext,
  ): Promise<void>;
}

export interface NativeConversationStore extends ConversationStore {
  /** Persisted format name, used in transport keys, bundles and records. */
  readonly format: string;
  /** Host directory that holds this format's captured conversations. */
  directory(repository: string, home?: string): string;
  /** Sandbox path that restoration writes for a captured conversation. */
  destination(id: string, sandbox: SandboxLease, original: string): string;
}
