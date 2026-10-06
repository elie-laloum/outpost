import type { ModelMessage } from "./model.types.ts";
import type { ModelRouteEvent } from "./harness-routing.types.ts";

export type TranscriptRecord =
  | {
      readonly type: "session";
      readonly version: 1 | 2;
      readonly id: string;
      readonly model: string;
      readonly parent?: string;
      readonly parentConversation?: string;
      readonly parentCallId?: string;
      readonly createdAt: string;
    }
  | ({ readonly type: "model-selection" } & ModelRouteEvent)
  | { readonly type: "message"; readonly message: ModelMessage }
  | { readonly type: "compaction"; readonly messages: readonly ModelMessage[] };
