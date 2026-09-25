import type { Daytona, DaytonaConfig } from "@daytona/sdk";
import { invariant } from "../domain/errors.ts";
import { posix } from "node:path";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { fileBatches } from "./file-batches.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cloudRoots } from "./cloud.constants.ts";
import { daytonaCommand } from "./daytona-command.ts";
import { daytonaFiles } from "./daytona-files.ts";
import type { DaytonaOptions } from "./daytona.types.ts";

export type { DaytonaOptions } from "./daytona.types.ts";

export function daytonaSandboxProvider(
  options: DaytonaOptions = {},
  connect: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">> = async (config) =>
    new (await import("@daytona/sdk")).Daytona(config),
): SandboxProvider {
  invariant(
    !("egress" in options) || options.egress === undefined,
    "Daytona does not support Outpost egress policies; configure provider-native networking explicitly",
  );
  return {
    name: "daytona",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const client = await connect(options.connection);
      const sandbox = await client.create(options.create ?? {});
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
      let home: string;
      let root: string;
      try {
        home = (await sandbox.getUserHomeDir()) ?? cloudRoots.daytonaHome;
        root = options.root ?? posix.join(home, "outpost");
        await sandbox.fs.createFolder(root, "755");
      } catch (cause) {
        try {
          await release();
        } catch (cleanup) {
          throw new AggregateError(
            [cause, cleanup],
            "Cloud setup and cleanup failed",
          );
        }
        throw cause;
      }
      const lease = {
        root,
        home,
        invoke: daytonaCommand({
          sandbox,
          root,
          options,
          context,
          isClosed: () => closed,
        }),
        ...daytonaFiles(sandbox),
        release,
      };
      return { ...lease, fileTransfers: fileBatches(lease) };
    },
  };
}
