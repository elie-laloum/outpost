export type ConversationFormat = "claude" | "codex";

export type StoredConversationFormat = ConversationFormat | "harness";

export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
