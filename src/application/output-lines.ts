import { observationDefaults } from "../domain/observation.constants.ts";

export function boundedLines(emit: (text: string, truncated: boolean) => void) {
  let pending = "";
  const limit = observationDefaults.outputCharacters;
  return {
    append(chunk: string) {
      for (let offset = 0; offset < chunk.length; offset += limit) {
        pending += chunk.slice(offset, offset + limit);
        let end: number;
        while ((end = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, end);
          emit(line.slice(0, limit), line.length > limit);
          pending = pending.slice(end + 1);
        }
        if (pending.length >= limit) {
          emit(pending.slice(0, limit), true);
          pending = pending.slice(limit);
        }
      }
    },
    flush() {
      if (pending) emit(pending, false);
      pending = "";
    },
  };
}
