import type { Readable } from "node:stream";
import { quote } from "../infrastructure/process.ts";
import { cloudInputScript } from "./cloud-input.constants.ts";
import type { CloudInputFeed } from "./cloud-input.types.ts";

const frame = (chunk: string | Buffer) =>
  `${Buffer.from(chunk).toString("base64")}\n`;

/** Initial content of the input file: framed stdin, when present. */
export function cloudInputFrames(stdin: string | undefined): string {
  return stdin ? frame(stdin) : "";
}

/** Shell words that run a quoted program with stdin fed from the input file. */
export function cloudInputProgram(file: string, program: string): string {
  return `node -e ${quote(cloudInputScript)} -- ${quote(file)} ${program}`;
}

/** Appends each live chunk, then the end frame, in order; the first failure stops data but still permits EOF. */
export function cloudInputFeed(
  input: Readable,
  append: (line: string) => Promise<void>,
  fail: (cause: unknown) => void,
  close: () => Promise<void> = () => append("\n"),
): CloudInputFeed {
  let queue = Promise.resolve();
  let failed = false;
  const push = (line: string) => {
    queue = queue.then(async () => {
      if (failed) return;
      try {
        await append(line);
      } catch (cause) {
        failed = true;
        fail(cause);
      }
    });
  };
  const data = (chunk: string | Buffer) => push(frame(chunk));
  const end = () => {
    queue = queue.then(async () => {
      try {
        await close();
      } catch (cause) {
        if (!failed) fail(cause);
        failed = true;
      }
    });
  };
  input.on("data", data);
  input.once("end", end);
  return {
    async finish() {
      input.off("data", data);
      input.off("end", end);
      failed = true;
      await queue;
    },
  };
}
