import { StringDecoder } from "node:string_decoder";
import { daytonaOutputPrefix } from "./daytona-command.constants.ts";

export function daytonaOutput(emit: (text: string) => void) {
  const decoder = new StringDecoder("utf8");
  let pending = "";
  let raw = false;
  return {
    write(chunk: string) {
      pending += chunk;
      while (pending) {
        if (raw) {
          const end = pending.indexOf("\n");
          const length = end === -1 ? pending.length : end + 1;
          emit(pending.slice(0, length));
          pending = pending.slice(length);
          raw = end === -1;
          continue;
        }
        if (daytonaOutputPrefix.startsWith(pending)) return;
        if (!pending.startsWith(daytonaOutputPrefix)) {
          raw = true;
          continue;
        }
        const end = pending.indexOf("\n");
        if (end === -1) return;
        const payload = pending.slice(daytonaOutputPrefix.length, end);
        const text = decoder.write(Buffer.from(payload, "base64"));
        if (text) emit(text);
        pending = pending.slice(end + 1);
      }
    },
    close() {
      const text = decoder.end();
      if (text) emit(text);
      if (pending) emit(pending);
      pending = "";
    },
  };
}
