import { randomUUID } from "node:crypto";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote } from "../infrastructure/process.ts";
import { cloudDefaults } from "./cloud.constants.ts";
import {
  cloudInputFeed,
  cloudInputFrames,
  cloudInputProgram,
} from "./cloud-input.ts";
import type { CloudInputFeed } from "./cloud-input.types.ts";
import type { VercelRuntime } from "./vercel.types.ts";

export function vercelCommand(runtime: VercelRuntime): SandboxLease["invoke"] {
  const { sandbox, root, options, context, isClosed } = runtime;
  return async (command) => {
    if (isClosed())
      throw new OutpostError("provider", "Cloud sandbox is closed");
    if (command.interactive)
      throw new OutpostError(
        "provider",
        "Interactive terminals require a mounted or local provider",
      );
    const signal = command.signal
      ? AbortSignal.any([
          command.signal,
          AbortSignal.timeout(command.deadlineMs ?? cloudDefaults.deadlineMs),
        ])
      : AbortSignal.timeout(command.deadlineMs ?? cloudDefaults.deadlineMs);
    signal.throwIfAborted();
    const inputPath = `/tmp/outpost-${randomUUID()}.stdin`;
    const pidPath = `${inputPath}.pid`;
    const live = command.input;
    const staged = live ? cloudInputFrames(command.stdin) : command.stdin;
    if (staged !== undefined)
      await sandbox.writeFiles([
        { path: inputPath, content: Buffer.from(staged) },
      ]);
    const output = { stdout: "", stderr: "" };
    const program = [command.executable, ...(command.arguments ?? [])]
      .map(quote)
      .join(" ");
    const { cmd, args } = live
      ? {
          cmd: "setsid",
          args: [
            "--wait",
            "sh",
            "-c",
            `echo $$ > ${quote(pidPath)}; exec ${cloudInputProgram(inputPath, program)}`,
          ],
        }
      : command.stdin === undefined
        ? { cmd: command.executable, args: [...(command.arguments ?? [])] }
        : {
            cmd: "sh",
            args: ["-c", `exec ${program} < ${quote(inputPath)}`],
          };
    const failure = new AbortController();
    const stopped = AbortSignal.any([signal, failure.signal]);
    let feed: CloudInputFeed | undefined;
    try {
      const running = await sandbox.runCommand({
        cmd,
        args,
        cwd: command.directory ?? root,
        env: { ...context.variables, ...command.variables },
        sudo: command.elevated ?? false,
        detached: true,
        signal: stopped,
        timeoutMs: command.deadlineMs ?? cloudDefaults.deadlineMs,
      });
      if (live)
        feed = cloudInputFeed(
          live,
          async (line) => {
            const appended = await sandbox.runCommand("sh", [
              "-c",
              `printf '%s' ${quote(line)} >> ${quote(inputPath)}`,
            ]);
            if (appended.exitCode !== 0)
              throw new OutpostError(
                "provider",
                "Cloud live input could not be appended",
              );
          },
          (cause) => failure.abort(cause),
        );
      try {
        for await (const log of running.logs({ signal: stopped })) {
          const channel = log.stream;
          if (channel !== "stdout" && channel !== "stderr") continue;
          output[channel] = (output[channel] + log.data).slice(
            -(command.retain ?? options.retain ?? cloudDefaults.retainBytes),
          );
          command.observe?.(channel, log.data);
        }
        const result = await running.wait({ signal: stopped });
        return { status: result.exitCode, ...output };
      } catch (cause) {
        await running.kill("SIGKILL", {
          abortSignal: AbortSignal.timeout(cloudDefaults.cancellationMs),
        });
        // The input wrapper runs the agent as a child; stop its whole process group.
        if (live)
          await sandbox
            .runCommand("sh", [
              "-c",
              `kill -KILL -$(cat ${quote(pidPath)}) 2>/dev/null || true`,
            ])
            .catch(() => undefined);
        throw cause;
      }
    } finally {
      await feed?.finish();
      if (staged !== undefined)
        await sandbox
          .runCommand("rm", ["-f", inputPath, pidPath])
          .catch(() => undefined);
    }
  };
}
