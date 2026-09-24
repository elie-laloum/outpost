import { StringDecoder } from "node:string_decoder";
import { ReadStream } from "node:tty";
import type { PtyHandle } from "@daytona/sdk";
import type { Command } from "../domain/command.types.ts";

export function terminalBridge(command: Command, retain: number) {
  const input = command.terminal?.input ?? process.stdin;
  const output = command.terminal?.output ?? process.stdout;
  const decoder = new StringDecoder("utf8");
  const wasPaused = input.isPaused();
  const raw = input instanceof ReadStream ? input.isRaw : false;
  let captured = "";
  let active = true;
  let pending = Promise.resolve();
  let sending = Promise.resolve();
  let handle: PtyHandle | undefined;
  let reject: (cause: unknown) => void = () => {};
  const failure = new Promise<never>((_resolve, fail) => {
    reject = fail;
  });
  void failure.catch(() => undefined);
  const size = () => ({
    cols:
      "columns" in output && typeof output.columns === "number"
        ? output.columns
        : 80,
    rows:
      "rows" in output && typeof output.rows === "number" ? output.rows : 24,
  });
  const capture = (text: string) => {
    captured = retain > 0 ? (captured + text).slice(-retain) : "";
    try {
      command.observe?.("stdout", text);
    } catch {}
  };
  const send = (data: string | Uint8Array) => {
    input.pause();
    sending = sending.then(async () => {
      if (active) await handle?.sendInput(data);
    });
    void sending.then(() => {
      if (active) input.resume();
    }, reject);
  };
  const end = () => send(new Uint8Array([4]));
  const resize = () => {
    const { cols, rows } = size();
    void handle?.resize(cols, rows).catch(reject);
  };
  const error = (cause: Error) => reject(cause);
  output.on("error", error);
  return {
    failure,
    size,
    output(data: Uint8Array) {
      if (!active) return;
      const bytes = Buffer.from(data);
      capture(decoder.write(bytes));
      pending = pending.then(
        () =>
          new Promise<void>((resolve, rejectWrite) => {
            if (!active) {
              resolve();
              return;
            }
            output.write(bytes, (cause) =>
              cause ? rejectWrite(cause) : resolve(),
            );
          }),
      );
      void pending.catch(reject);
    },
    connect(pty: PtyHandle) {
      handle = pty;
      if (input instanceof ReadStream) input.setRawMode(true);
      input.on("data", send);
      input.on("end", end);
      input.on("error", error);
      output.on("resize", resize);
      if (input.readableEnded) end();
      input.resume();
    },
    async flush() {
      await Promise.race([pending, failure]);
      capture(decoder.end());
    },
    text: () => captured,
    close() {
      active = false;
      input.removeListener("data", send);
      input.removeListener("end", end);
      input.removeListener("error", error);
      output.removeListener("resize", resize);
      output.removeListener("error", error);
      if (wasPaused || input.listenerCount("data") === 0) input.pause();
      if (!wasPaused && input.listenerCount("data") > 0) input.resume();
      if (input instanceof ReadStream) input.setRawMode(raw);
    },
  };
}
