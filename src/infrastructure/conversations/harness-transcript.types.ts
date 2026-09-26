import type { ConversationStore } from "../../domain/conversation.types.ts";
import type { ModelMessage } from "../../domain/model.types.ts";
import type { TranscriptRecord } from "../../domain/transcript.types.ts";

export interface TranscriptOptions {
  readonly repository: string;
  readonly store: ConversationStore;
  readonly model: string;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
}

export interface TranscriptHandle {
  readonly id: string;
  readonly messages: readonly ModelMessage[];
  append(record: TranscriptRecord): Promise<void>;
  close(): Promise<void>;
}
