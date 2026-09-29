/** Persisted name of a conversation format, such as "claude" or "harness". */
export type ConversationFormat = string;

export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
