import type { ModelMessage } from "./model.types.ts";

export type TranscriptRecord =
  | {
      readonly type: "session";
      readonly version: 1;
      readonly id: string;
      readonly model: string;
      readonly parent?: string;
      readonly createdAt: string;
    }
  | { readonly type: "message"; readonly message: ModelMessage }
  | { readonly type: "compaction"; readonly messages: readonly ModelMessage[] };
