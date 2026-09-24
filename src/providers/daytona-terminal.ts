import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import type { PtyHandle } from "@daytona/sdk";
import type { Command, CommandResult } from "../domain/command.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { interruptible } from "../infrastructure/abort.ts";
import { quote } from "../infrastructure/process.ts";
import { cloudDefaults } from "./cloud.constants.ts";
import type { DaytonaRuntime } from "./daytona.types.ts";
import { terminalBridge } from "./terminal-bridge.ts";

export async function daytonaTerminal(
  runtime: DaytonaRuntime,
  command: Command,
  signal: AbortSignal,
): Promise<CommandResult> {
  const { sandbox, root, options, context } = runtime;
  const id = `outpost-${randomUUID()}`;
  const base = `/tmp/${id}`;
  const program = [
    ...(command.elevated ? ["sudo", "-n", "--"] : []),
    command.executable,
    ...(command.arguments ?? []),
  ]
    .map(quote)
    .join(" ");
  const script = `kill -0 -$$ 2>/dev/null || exit 125
echo $$ > ${quote(base + ".pid")}
${program}
status=$?
printf '%s' "$status" > ${quote(base + ".status")}
exit "$status"
`;
  let handle: PtyHandle | undefined;
  let bridge: ReturnType<typeof terminalBridge> | undefined;
  let completed = false;
  let creating = false;
  let failure: unknown;
  try {
    await sandbox.fs.uploadFile(Buffer.from(script), base);
    signal.throwIfAborted();
    bridge = terminalBridge(
      command,
      command.retain ?? options.retain ?? cloudDefaults.retainBytes,
    );
    // createPty owns its connection timeout; await ownership before cancellation cleanup.
    creating = true;
    handle = await sandbox.process.createPty({
      id,
      cwd: command.directory ?? root,
      envs: {
        TERM: process.env.TERM ?? "xterm-256color",
        ...context.variables,
        ...command.variables,
      },
      ...bridge.size(),
      onData: bridge.output,
    });
    signal.throwIfAborted();
    await interruptible(handle.sendInput(`exec sh ${quote(base)}\n`), signal);
    bridge.connect(handle);
    if (command.stdin !== undefined)
      await interruptible(handle.sendInput(command.stdin), signal);
    let nativeStatus: number | undefined;
    const nativeFailure = handle.wait().then((exit) => {
      nativeStatus = exit.exitCode;
      if (exit.error && exit.exitCode === undefined)
        throw new OutpostError(
          "provider",
          `Daytona terminal failed: ${exit.error}`,
        );
      return new Promise<never>(() => {});
    });
    void nativeFailure.catch(() => undefined);
    // The SDK can infer success from socket closure; the script records process completion.
    while (true) {
      const status = await interruptible(
        Promise.race([
          sandbox.process.executeCommand(
            `if [ -f ${quote(base + ".status")} ]; then cat ${quote(base + ".status")}; else exit 3; fi`,
          ),
          bridge.failure,
          nativeFailure,
        ]),
        signal,
      );
      const recorded =
        status.exitCode === 0 && /^\d+$/.test(status.result.trim());
      if (
        recorded ||
        (status.exitCode === 3 &&
          nativeStatus !== undefined &&
          nativeStatus !== 0)
      ) {
        completed = true;
        await interruptible(bridge.flush(), signal);
        return {
          status: recorded ? Number(status.result.trim()) : nativeStatus!,
          stdout: bridge.text(),
          stderr: "",
        };
      }
      if (status.exitCode !== 3)
        throw new OutpostError(
          "provider",
          "Daytona terminal returned invalid completion status",
        );
      await Promise.race([
        setTimeout(cloudDefaults.pollMs, undefined, { signal }),
        bridge.failure,
        nativeFailure,
      ]);
    }
  } catch (cause) {
    failure = signal.aborted ? signal.reason : cause;
    throw failure;
  } finally {
    const errors: unknown[] = [];
    const cleanup = async (operation: () => unknown) => {
      try {
        await interruptible(
          Promise.resolve().then(operation),
          AbortSignal.timeout(cloudDefaults.cancellationMs),
        );
      } catch (cause) {
        errors.push(cause);
      }
    };
    await cleanup(() => bridge?.close());
    if (!completed) {
      // The native PTY already supplies a session; terminate its existing process group.
      const kill = `if [ -f ${quote(base + ".pid")} ]; then p=$(cat ${quote(base + ".pid")}); kill -KILL -"$p" 2>/dev/null || true; fi`;
      await cleanup(() =>
        sandbox.process.executeCommand(
          command.elevated ? `sudo -n sh -c ${quote(kill)}` : kill,
        ),
      );
      if (creating)
        await cleanup(async () => {
          try {
            if (handle) return await handle.kill();
            await sandbox.process.killPtySession(id);
          } catch (cause) {
            if (!(
              cause instanceof Error && cause.name === "DaytonaNotFoundError"
            ))
              throw cause;
          }
        });
    }
    await cleanup(() => handle?.disconnect());
    await cleanup(() =>
      sandbox.process.executeCommand(
        `rm -f ${quote(base)} ${quote(base + ".pid")} ${quote(base + ".status")}`,
      ),
    );
    if (errors.length)
      throw new AggregateError(
        failure === undefined ? errors : [failure, ...errors],
        "Daytona terminal cleanup failed",
      );
  }
}
