import { randomUUID } from "node:crypto";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote } from "../infrastructure/process.ts";
import { cloudDefaults } from "./cloud.constants.ts";
import type { VercelRuntime } from "./vercel.types.ts";

export function vercelCommand(runtime: VercelRuntime): SandboxLease["invoke"] {
  const { sandbox, root, options, isClosed } = runtime;
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
    if (command.stdin !== undefined)
      await sandbox.writeFiles([
        { path: inputPath, content: Buffer.from(command.stdin) },
      ]);
    const output = { stdout: "", stderr: "" };
    const cmd = command.stdin === undefined ? command.executable : "sh";
    const args =
      command.stdin === undefined
        ? [...(command.arguments ?? [])]
        : [
            "-c",
            `exec ${[command.executable, ...(command.arguments ?? [])].map(quote).join(" ")} < ${quote(inputPath)}`,
          ];
    try {
      const running = await sandbox.runCommand({
        cmd,
        args,
        cwd: command.directory ?? root,
        env: { ...command.variables },
        sudo: command.elevated ?? false,
        detached: true,
        signal,
        timeoutMs: command.deadlineMs ?? cloudDefaults.deadlineMs,
      });
      try {
        for await (const log of running.logs({ signal })) {
          const channel = log.stream;
          if (channel !== "stdout" && channel !== "stderr") continue;
          output[channel] = (output[channel] + log.data).slice(
            -(command.retain ?? options.retain ?? cloudDefaults.retainBytes),
          );
          command.observe?.(channel, log.data);
        }
        const result = await running.wait({ signal });
        return { status: result.exitCode, ...output };
      } catch (cause) {
        await running.kill("SIGKILL", {
          abortSignal: AbortSignal.timeout(cloudDefaults.cancellationMs),
        });
        throw cause;
      }
    } finally {
      if (command.stdin !== undefined)
        await sandbox
          .runCommand("rm", ["-f", inputPath])
          .catch(() => undefined);
    }
  };
}
