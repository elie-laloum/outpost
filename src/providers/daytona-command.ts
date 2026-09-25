import { setTimeout } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { interruptible } from "../infrastructure/abort.ts";
import { quote } from "../infrastructure/process.ts";
import { cloudDefaults } from "./cloud.constants.ts";
import { daytonaCommandScript } from "./daytona-command.constants.ts";
import { daytonaOutput } from "./daytona-output.ts";
import { daytonaTerminal } from "./daytona-terminal.ts";
import type { DaytonaRuntime } from "./daytona.types.ts";

export function daytonaCommand(
  runtime: DaytonaRuntime,
): SandboxLease["invoke"] {
  const { sandbox, root, options, context, isClosed } = runtime;
  return async (command) => {
    if (isClosed())
      throw new OutpostError("provider", "Cloud sandbox is closed");
    const signal = command.signal
      ? AbortSignal.any([
          command.signal,
          AbortSignal.timeout(command.deadlineMs ?? cloudDefaults.deadlineMs),
        ])
      : AbortSignal.timeout(command.deadlineMs ?? cloudDefaults.deadlineMs);
    signal.throwIfAborted();
    if (command.interactive) return daytonaTerminal(runtime, command, signal);
    const id = `outpost-${randomUUID()}`;
    const input = `/tmp/${id}.stdin`;
    const pid = `/tmp/${id}.pid`;
    if (command.stdin !== undefined)
      await sandbox.fs.uploadFile(Buffer.from(command.stdin), input);
    const variables = { ...context.variables, ...command.variables };
    const program = [
      ...(command.elevated ? ["sudo", "-n", "--"] : []),
      command.executable,
      ...(command.arguments ?? []),
    ]
      .map(quote)
      .join(" ");
    const script = `cd ${quote(command.directory ?? root)} && env ${Object.entries(
      variables,
    )
      .map(([key, value]) => quote(`${key}=${value}`))
      .join(
        " ",
      )} setsid --wait sh -c ${quote(`echo $$ > ${quote(pid)}; test ! -f ${quote(pid + ".cancel")} || exit 130; exec node -e ${quote(daytonaCommandScript)} -- ${program}${command.stdin === undefined ? "" : ` < ${quote(input)}`}`)}`;
    const output = { stdout: "", stderr: "" };
    let cancellation: Promise<unknown> | undefined;
    const cancel = () => {
      cancellation ??= sandbox.process.executeCommand(
        `touch ${quote(pid + ".cancel")}; if [ -f ${quote(pid)} ]; then kill -KILL -$(cat ${quote(pid)}) 2>/dev/null || true; fi`,
      );
      void cancellation.catch(() => undefined);
    };
    await sandbox.process.createSession(id);
    try {
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      signal.throwIfAborted();
      const response = await interruptible(
        sandbox.process.executeSessionCommand(id, {
          command: script,
          async: true,
        }),
        signal,
      );
      if (!response.cmdId)
        throw new OutpostError(
          "provider",
          "Cloud provider returned no command identifier",
        );
      const consume = (channel: "stdout" | "stderr") => (chunk: string) => {
        output[channel] = (output[channel] + chunk).slice(
          -(command.retain ?? options.retain ?? cloudDefaults.retainBytes),
        );
        command.observe?.(channel, chunk);
      };
      const stdout = daytonaOutput(consume("stdout"));
      const stderr = daytonaOutput(consume("stderr"));
      await interruptible(
        sandbox.process.getSessionCommandLogs(
          id,
          response.cmdId,
          stdout.write,
          stderr.write,
        ),
        signal,
      );
      stdout.close();
      stderr.close();
      if (cancellation) await cancellation;
      signal.throwIfAborted();
      while (true) {
        const result = await interruptible(
          sandbox.process.getSessionCommand(id, response.cmdId),
          signal,
        );
        if (result.exitCode !== undefined)
          return { status: result.exitCode, ...output };
        await setTimeout(cloudDefaults.pollMs, undefined, { signal });
      }
    } catch (cause) {
      cancel();
      try {
        await interruptible(
          cancellation!,
          AbortSignal.timeout(cloudDefaults.cancellationMs),
        );
      } catch (cleanup) {
        throw new AggregateError(
          [cause, cleanup],
          "Cloud cancellation could not be confirmed",
        );
      }
      throw cause;
    } finally {
      signal.removeEventListener("abort", cancel);
      await sandbox.process.deleteSession(id);
      await sandbox.process
        .executeCommand(`rm -f ${quote(input)} ${quote(pid)}`)
        .catch(() => undefined);
    }
  };
}
