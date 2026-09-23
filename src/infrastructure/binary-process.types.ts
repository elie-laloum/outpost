import type { Readable, Writable } from "node:stream";

export interface BinaryStreams {
  readonly input?: Readable;
  readonly output?: Writable;
}
