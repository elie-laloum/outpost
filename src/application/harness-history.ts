import type { ModelMessage } from "../domain/model.types.ts";
import type { TranscriptHandle } from "../infrastructure/conversations/harness-transcript.types.ts";
import type { HarnessHistory } from "./harness.types.ts";

export function harnessHistory(transcript?: TranscriptHandle): HarnessHistory {
  let messages: readonly ModelMessage[] = transcript?.messages ?? [];
  return {
    get messages() {
      return messages;
    },
    async append(message) {
      await transcript?.append({ type: "message", message });
      messages = [...messages, message];
    },
    async replace(next) {
      await transcript?.append({ type: "compaction", messages: next });
      messages = [...next];
    },
  };
}
