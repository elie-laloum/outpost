import { spawn } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import type {
  Channel,
  Command,
  CommandResult,
} from "../domain/command.types.ts";
import { OutpostError, positive } from "../domain/errors.ts";
import { outputChannels, processDefaults } from "./process.constants.ts";
import type { Executor } from "./process.types.ts";
import { restoreTerminal } from "./terminal.ts";

export type { Executor } from "./process.types.ts";

export const executeProcess: Executor = (command) => {
  command.signal?.throwIfAborted();
  const deadline = command.deadlineMs ?? processDefaults.deadlineMs;
  positive(deadline, "deadlineMs");
  const limit = command.retain ?? processDefaults.retainBytes;
  positive(limit, "retain");
  return new Promise((resolve, reject) => {
    const interactive = command.interactive === true;
    const child = spawn(command.executable, [...(command.arguments ?? [])], {
      cwd: command.directory,
      env: { ...process.env, ...command.variables },
      shell: false,
      windowsHide: true,
      detached: !interactive && process.platform !== "win32",
      stdio:
        interactive && !command.terminal ? "inherit" : ["pipe", "pipe", "pipe"],
    });
    const decoder = {
      stdout: new StringDecoder("utf8"),
      stderr: new StringDecoder("utf8"),
    };
    const output = { stdout: "", stderr: "" };
    let failed = false,
      reason: unknown,
      escalation: ReturnType<typeof setTimeout> | undefined;
    function kill(hard: boolean): void {
      if (!child.pid) return;
      if (process.platform === "win32") {
        const killer = spawn(
          "taskkill",
          ["/PID", String(child.pid), "/T", "/F"],
          { windowsHide: true, stdio: "ignore" },
        );
        killer.on("error", () => {
          child.kill();
        });
        killer.on("exit", (status) => {
          if (status !== 0) child.kill();
        });
        if (hard) child.kill();
      } else {
        try {
          process.kill(
            interactive ? child.pid : -child.pid,
            hard ? "SIGKILL" : "SIGTERM",
          );
        } catch {
          child.kill(hard ? "SIGKILL" : "SIGTERM");
        }
      }
    }
    function interrupt(error: unknown): void {
      if (failed) return;
      failed = true;
      reason = error;
      kill(false);
      escalation = setTimeout(() => kill(true), processDefaults.killGraceMs);
    }
    const abort = () =>
      interrupt(
        command.signal?.reason ??
          new OutpostError("aborted", "Command cancelled"),
      );
    const timer = setTimeout(
      () =>
        interrupt(
          new OutpostError("timeout", `Command exceeded ${deadline} ms`, {
            deadlineMs: deadline,
          }),
        ),
      deadline,
    );
    const consume = (channel: Channel, text: string) => {
      output[channel] = (output[channel] + text).slice(-limit);
      try {
        command.observe?.(channel, text);
      } catch (error) {
        interrupt(error);
      }
    };
    child.stdout?.on("data", (data: Buffer) =>
      consume("stdout", decoder.stdout.write(data)),
    );
    child.stderr?.on("data", (data: Buffer) =>
      consume("stderr", decoder.stderr.write(data)),
    );
    child.stdin?.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code !== "EPIPE") interrupt(error);
    });
    child.on("error", (error) => {
      failed = true;
      reason = error;
    });
    command.signal?.addEventListener("abort", abort, { once: true });
    if (command.signal?.aborted) abort();
    child.on("close", (status) => {
      if (interactive) restoreTerminal();
      if (child.stdin) command.terminal?.input?.unpipe(child.stdin);
      clearTimeout(timer);
      clearTimeout(escalation);
      command.signal?.removeEventListener("abort", abort);
      for (const channel of outputChannels) {
        const tail = decoder[channel].end();
        if (tail) consume(channel, tail);
      }
      if (failed) reject(reason);
      else resolve({ status: status ?? 1, ...output });
    });
    if (child.stdin && command.terminal?.input)
      command.terminal.input.pipe(child.stdin);
    else child.stdin?.end(command.stdin);
    if (child.stdout && command.terminal?.output)
      child.stdout.pipe(command.terminal.output, { end: false });
    if (child.stderr && command.terminal?.error)
      child.stderr.pipe(command.terminal.error, { end: false });
  });
};

export async function requireSuccess(
  command: Command,
  executor = executeProcess,
): Promise<CommandResult> {
  const result = await executor(command);
  if (result.status !== 0)
    throw new OutpostError(
      "process",
      `${command.executable} exited with status ${result.status}`,
      { ...result },
    );
  return result;
}

export function shell(
  script: string,
): Pick<Command, "executable" | "arguments"> {
  return process.platform === "win32"
    ? {
        executable: "powershell.exe",
        arguments: ["-NoProfile", "-NonInteractive", "-Command", script],
      }
    : { executable: "sh", arguments: ["-c", script] };
}

export function quote(value: string): string {
  if (value.includes("\0"))
    throw new OutpostError(
      "configuration",
      "A command argument cannot contain NUL",
    );
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}
