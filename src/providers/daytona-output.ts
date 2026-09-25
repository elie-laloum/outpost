import { StringDecoder } from "node:string_decoder";
import { daytonaOutputPrefix } from "./daytona-command.constants.ts";

export function daytonaOutput(emit: (text: string) => void) {
  const decoder = new StringDecoder("utf8");
  let pending = "";
  return {
    write(chunk: string) {
      pending += chunk;
      while (pending) {
        if (daytonaOutputPrefix.startsWith(pending)) return;
        if (!pending.startsWith(daytonaOutputPrefix)) {
          emit(pending);
          pending = "";
          return;
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
