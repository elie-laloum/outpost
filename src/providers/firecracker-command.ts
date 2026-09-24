import { randomUUID } from "node:crypto";
import { invariant, OutpostError, positive } from "../domain/errors.ts";
import type { Command } from "../domain/command.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import {
  executeProcess,
  quote,
  requireSuccess,
} from "../infrastructure/process.ts";
import { firecrackerDefaults } from "./firecracker.constants.ts";
import type {
  FirecrackerOptions,
  FirecrackerRuntime,
} from "./firecracker.types.ts";

export function firecrackerSsh(
  options: FirecrackerOptions,
  script: string,
): Command {
  const ssh = options.ssh;
  return {
    executable: ssh.binary ?? "ssh",
    arguments: [
      "-F",
      "/dev/null",
      "-T",
      "-o",
      "BatchMode=yes",
      "-o",
      "IdentitiesOnly=yes",
      "-o",
      "StrictHostKeyChecking=yes",
      "-o",
      `UserKnownHostsFile=${ssh.knownHosts}`,
      "-o",
      "GlobalKnownHostsFile=/dev/null",
      "-o",
      "ConnectTimeout=2",
      "-o",
      "ServerAliveInterval=2",
      "-o",
      "ServerAliveCountMax=2",
      "-i",
      ssh.identity,
      "-p",
      String(ssh.port ?? 22),
      "-l",
      ssh.user,
      "--",
      ssh.host,
      script,
    ],
  };
}

export function firecrackerCommand(
  runtime: FirecrackerRuntime,
): SandboxLease["invoke"] {
  return async (command) => {
    if (runtime.isClosed())
      throw new OutpostError("provider", "Firecracker sandbox is closed");
    invariant(
      !command.interactive && !command.elevated,
      "Firecracker research provider does not support interactive or elevated commands",
    );
    command.signal?.throwIfAborted();
    const variables = { ...runtime.variables, ...command.variables };
    invariant(
      Object.keys(variables).every((key) =>
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(key),
      ),
      "Invalid environment key",
    );
    const id = `/tmp/outpost-command-${randomUUID()}`;
    const wrapper = `umask 077; echo $$ > ${quote(id)}; test ! -e ${quote(id + ".cancel")} || exit 130; cd ${quote(command.directory ?? runtime.root)} || exit; exec env ${Object.entries(
      variables,
    )
      .map(([key, value]) => quote(`${key}=${value}`))
      .join(
        " ",
      )} ${[command.executable, ...(command.arguments ?? [])].map(quote).join(" ")}`;
    const stop = new AbortController();
    const signal = command.signal
      ? AbortSignal.any([command.signal, stop.signal])
      : stop.signal;
    const deadlineMs = command.deadlineMs ?? firecrackerDefaults.commandMs;
    positive(deadlineMs, "deadlineMs");
    let cancellation: Promise<unknown> | undefined;
    const cancel = () => {
      cancellation ??= requireSuccess(
        {
          ...firecrackerSsh(
            runtime.options,
            `umask 077; touch ${quote(id + ".cancel")}; if [ -f ${quote(id)} ]; then node -e ${quote("const fs=require('node:fs');const pid=Number(fs.readFileSync(process.argv[1],'utf8'));if(!Number.isSafeInteger(pid)||pid<2)process.exit(1);const kill=s=>{try{process.kill(-pid,s)}catch(e){if(e.code!=='ESRCH')throw e}};kill('SIGTERM');setTimeout(()=>kill('SIGKILL'),100)")} ${quote(id)}; fi`,
          ),
          deadlineMs: firecrackerDefaults.cleanupMs,
        },
        executeProcess,
      );
      void cancellation.catch(() => undefined);
    };
    signal.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(
      () =>
        stop.abort(
          new OutpostError("timeout", `Command exceeded ${deadlineMs} ms`),
        ),
      deadlineMs,
    );
    let interrupted = false;
    try {
      const {
        directory: _directory,
        variables: _variables,
        ...invocation
      } = command;
      const result = await runtime.executor({
        ...invocation,
        ...(command.observe
          ? {
              observe: (channel, text) => {
                try {
                  command.observe!(channel, text);
                } catch (cause) {
                  stop.abort(cause);
                }
              },
            }
          : {}),
        signal,
        ...firecrackerSsh(
          runtime.options,
          `setsid --wait sh -c ${quote(wrapper)}`,
        ),
      });
      signal.throwIfAborted();
      return result;
    } catch (cause) {
      interrupted = true;
      try {
        cancel();
        await cancellation;
      } catch (cleanup) {
        throw new AggregateError(
          [cause, cleanup],
          "Guest cancellation could not be confirmed; release the VM",
        );
      }
      throw cause;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      if (!interrupted && !runtime.isClosed())
        await executeProcess({
          ...firecrackerSsh(runtime.options, `rm -f -- ${quote(id)}`),
          deadlineMs: firecrackerDefaults.cleanupMs,
        }).catch(() => undefined);
    }
  };
}
