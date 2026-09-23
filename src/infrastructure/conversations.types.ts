export type ConversationFormat = "claude" | "codex";

export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
