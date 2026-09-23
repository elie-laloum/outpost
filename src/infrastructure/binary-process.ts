import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";
import type { CommandResult } from "../domain/command.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { BinaryStreams } from "./binary-process.types.ts";
import { processDefaults } from "./process.constants.ts";
import type { Executor } from "./process.types.ts";
import { transfer } from "./transfer.ts";

export function binaryExecutor(streams: BinaryStreams): Executor {
  return (command) =>
    transfer(command, async (signal) => {
      signal.throwIfAborted();
      const child = spawn(command.executable, [...(command.arguments ?? [])], {
        cwd: command.directory,
        env: { ...process.env, ...command.variables },
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
        signal,
        killSignal: "SIGKILL",
      });
      let stderr = "";
      child.stderr.on("data", (data: Buffer) => {
        stderr = (stderr + data.toString("utf8")).slice(
          -processDefaults.retainBytes,
        );
      });
      const completion = new Promise<CommandResult>((resolve, reject) => {
        child.on("error", reject);
        child.on("close", (status) => {
          if (status !== 0)
            reject(
              new OutpostError(
                "process",
                `${command.executable} exited with status ${status}`,
                { status, stderr },
              ),
            );
          else resolve({ status: 0, stdout: "", stderr });
        });
      });
      const pending: Promise<unknown>[] = [completion];
      if (streams.input)
        pending.push(pipeline(streams.input, child.stdin, { signal }));
      else child.stdin.end();
      if (streams.output)
        pending.push(pipeline(child.stdout, streams.output, { signal }));
      else child.stdout.resume();
      try {
        await Promise.all(pending);
        return await completion;
      } catch (cause) {
        child.kill("SIGKILL");
        streams.input?.destroy();
        streams.output?.destroy();
        await Promise.allSettled(pending);
        signal.throwIfAborted();
        throw cause;
      }
    });
}
