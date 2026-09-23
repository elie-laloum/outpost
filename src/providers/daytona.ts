import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import type {
  Daytona,
  DaytonaConfig,
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
} from "@daytona/sdk";
import type { SandboxProvider, Variables } from "../domain/ports.ts";
import { OutpostError } from "../domain/errors.ts";
import { quote } from "../infrastructure/process.ts";
import { interruptible } from "../infrastructure/abort.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { downloadTree, manifestScript, uploadTree } from "./cloud-files.ts";
import { transfer } from "../infrastructure/transfer.ts";

export interface DaytonaOptions {
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}

export function daytona(
  options: DaytonaOptions = {},
  connect: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">> = async (config) =>
    new (await import("@daytona/sdk")).Daytona(config),
): SandboxProvider {
  return {
    name: "daytona",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const client = await connect(options.connection);
      const sandbox = await client.create(options.create ?? {});
      const home = (await sandbox.getUserHomeDir()) ?? "/home/daytona";
      const root = options.root ?? posix.join(home, "outpost");
      let closed = false,
        releasing: Promise<void> | undefined;
      let unregister = () => {};
      const release = () =>
        (releasing ??= client
          .delete(sandbox)
          .then(() => {
            closed = true;
            unregister();
          })
          .catch((error) => {
            releasing = undefined;
            throw error;
          }));
      unregister = registerCleanup(release);
      try {
        await sandbox.fs.createFolder(root, "755");
      } catch (cause) {
        await release();
        throw cause;
      }
      return {
        root,
        home,
        async invoke(command) {
          if (closed)
            throw new OutpostError("provider", "Cloud sandbox is closed");
          if (command.interactive)
            throw new OutpostError(
              "provider",
              "Interactive terminals require a mounted or local provider",
            );
          const signal = command.signal
            ? AbortSignal.any([
                command.signal,
                AbortSignal.timeout(command.deadlineMs ?? 600_000),
              ])
            : AbortSignal.timeout(command.deadlineMs ?? 600_000);
          signal.throwIfAborted();
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
          const script = `cd ${quote(command.directory ?? root)} && exec env ${Object.entries(
            variables,
          )
            .map(([key, value]) => quote(`${key}=${value}`))
            .join(
              " ",
            )} setsid sh -c ${quote(`echo $$ > ${quote(pid)}; test ! -f ${quote(pid + ".cancel")} || exit 130; exec ${program}${command.stdin === undefined ? "" : ` < ${quote(input)}`}`)}`;
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
            const consume =
              (channel: "stdout" | "stderr") => (chunk: string) => {
                output[channel] = (output[channel] + chunk).slice(
                  -(command.retain ?? options.retain ?? 65_536),
                );
                command.observe?.(channel, chunk);
              };
            await interruptible(
              sandbox.process.getSessionCommandLogs(
                id,
                response.cmdId,
                consume("stdout"),
                consume("stderr"),
              ),
              signal,
            );
            if (cancellation) await cancellation;
            signal.throwIfAborted();
            const result = await sandbox.process.getSessionCommand(
              id,
              response.cmdId,
            );
            if (result.exitCode === undefined)
              throw new OutpostError(
                "provider",
                "Cloud command ended without an exit status",
              );
            return { status: result.exitCode, ...output };
          } catch (cause) {
            cancel();
            try {
              await interruptible(cancellation!, AbortSignal.timeout(15_000));
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
        },
        async upload(source, destination, options = {}) {
          return transfer(options, async (signal) => {
            await uploadTree(
              source,
              destination,
              async (path, content) => {
                await sandbox.fs.createFolder(posix.dirname(path), "755");
                await sandbox.fs.uploadFile(content, path);
              },
              async (target, path) => {
                const result = await sandbox.process.executeCommand(
                  `mkdir -p ${quote(posix.dirname(path))} && ln -s -- ${quote(target)} ${quote(path)}`,
                );
                if (result.exitCode !== 0)
                  throw new OutpostError("provider", "Symlink upload failed");
              },
              async (path, directory, mode) => {
                if (directory)
                  await sandbox.fs.createFolder(path, mode.toString(8));
                else {
                  const result = await sandbox.process.executeCommand(
                    `chmod ${mode.toString(8)} ${quote(path)}`,
                  );
                  if (result.exitCode !== 0)
                    throw new OutpostError(
                      "provider",
                      "Transfer permissions could not be set",
                    );
                }
              },
              signal,
            );
          });
        },
        async download(source, destination, options = {}) {
          return transfer(options, async (signal) => {
            const listing = await sandbox.process.executeCommand(
              `node -e ${quote(manifestScript)} ${quote(source)}`,
            );
            if (listing.exitCode !== 0)
              throw new OutpostError(
                "provider",
                "Remote transfer source is unavailable",
              );
            await downloadTree(
              source,
              destination,
              listing.result,
              (path) => sandbox.fs.downloadFile(path),
              signal,
            );
          });
        },
        release,
      };
    },
  };
}
