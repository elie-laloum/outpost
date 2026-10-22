import { spawn } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import type {
  SupervisedCommand,
  SupervisedExit,
  SupervisedProcess,
} from "./supervised-process.types.ts";

/** Starts a process that keeps running until it exits or is stopped. */
export function superviseProcess(
  command: SupervisedCommand,
): SupervisedProcess {
  const child = spawn(command.executable, [...command.arguments], {
    cwd: command.directory,
    env: process.env,
    shell: false,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const channel of ["stdout", "stderr"] as const) {
    const decoder = new StringDecoder("utf8");
    child[channel].on("data", (data: Buffer) =>
      command.output(channel, decoder.write(data)),
    );
    child[channel].on("end", () => {
      const tail = decoder.end();
      if (tail) command.output(channel, tail);
    });
  }
  const exited = new Promise<SupervisedExit>((done, fail) => {
    child.once("error", fail);
    child.once("close", (status, signal) => done({ status, signal }));
  });
  let stops = 0;
  return {
    exited,
    stop() {
      if (child.exitCode !== null || child.signalCode !== null) return;
      // SIGTERM lets the CLI cancel and release its sandbox; Windows has no graceful signal.
      child.kill(stops++ === 0 ? "SIGTERM" : "SIGKILL");
    },
  };
}
