import type { TransportReference } from "./transport.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";

export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly reference?: TransportReference;
  readonly format: string;
}

export interface ConversationContext {
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}

export interface ConversationStore {
  readonly name: string;
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
