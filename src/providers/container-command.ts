import { randomUUID } from "node:crypto";
import { invariant, OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote } from "../infrastructure/process.ts";
import { containerDefaults } from "./container.constants.ts";
import type { ContainerRuntime } from "./container.types.ts";

export function containerCommand(
  runtime: ContainerRuntime,
): SandboxLease["invoke"] {
  const { engine, config, executor, root, name, env, call, isClosed } = runtime;
  return async (command) => {
    if (isClosed())
      throw new OutpostError("provider", "Container sandbox is closed");
    command.signal?.throwIfAborted();
    const id = randomUUID();
    const pidFile = `/tmp/outpost-${id}.pid`;
    const variables = { ...env, ...command.variables };
    invariant(
      Object.keys(variables).every((key) =>
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(key),
      ),
      "Invalid environment key",
    );
    const environment = Object.fromEntries(
      Object.entries(variables).map(([, value], index) => [
        `OUTPOST_VALUE_${index}`,
        value,
      ]),
    );
    const exports = Object.keys(variables)
      .map(
        (key, index) =>
          `export ${key}="$OUTPOST_VALUE_${index}"; unset OUTPOST_VALUE_${index};`,
      )
      .join(" ");
    const flags = [
      "exec",
      command.interactive && process.stdin.isTTY ? "-it" : "-i",
      ...(command.elevated ? ["--user", "0:0"] : []),
      "--workdir",
      command.directory ?? root,
      ...Object.keys(environment).flatMap((key) => ["--env", key]),
      name,
    ];
    const wrapper = `${exports} echo $$ > ${quote(pidFile)}; test ! -f ${quote(pidFile + ".cancel")} || exit 130; exec "$@"`;
    const { directory: _directory, ...invocation } = command;
    let interrupted = false;
    try {
      return await executor({
        ...invocation,
        executable: engine,
        arguments: [
          ...flags,
          ...(command.interactive && process.stdin.isTTY
            ? []
            : ["setsid", "--wait"]),
          "sh",
          "-c",
          wrapper,
          "outpost",
          command.executable,
          ...(command.arguments ?? []),
        ],
        variables: environment,
        retain:
          command.retain ?? config.retain ?? containerDefaults.retainBytes,
      });
    } catch (cause) {
      interrupted = true;
      try {
        await call([
          "exec",
          ...(command.elevated ? ["--user", "0:0"] : []),
          name,
          "sh",
          "-c",
          `touch ${quote(pidFile + ".cancel")}; if [ -f ${quote(pidFile)} ]; then p=$(cat ${quote(pidFile)}); kill -TERM -"$p" 2>/dev/null || true; sleep 0.1; kill -KILL -"$p" 2>/dev/null || true; fi`,
        ]);
      } catch (cleanup) {
        throw new AggregateError(
          [cause, cleanup],
          "Command cancellation could not be confirmed",
        );
      }
      throw cause;
    } finally {
      if (!isClosed() && !interrupted)
        await call(["exec", name, "rm", "-f", pidFile]).catch(() => undefined);
    }
  };
}
