import type { Daytona, DaytonaConfig } from "@daytona/sdk";
import { posix } from "node:path";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { fileBatches } from "./file-batches.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cloudRoots } from "./cloud.constants.ts";
import {
  daytonaNetworkPolicy,
  confirmDaytonaNetworkPolicy,
} from "./daytona-network.ts";
import { daytonaCommand } from "./daytona-command.ts";
import { daytonaFiles } from "./daytona-files.ts";
import type { DaytonaOptions } from "./daytona.types.ts";

export type { DaytonaOptions } from "./daytona.types.ts";

export function createDaytonaSandboxProvider(
  options: DaytonaOptions = {},
  connect: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">> = async (config) =>
    new (await import("@daytona/sdk")).Daytona(config),
): SandboxProvider {
  const networkPolicy = daytonaNetworkPolicy(options);
  const create = { ...options.create, ...networkPolicy };
  return {
    name: "daytona",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const client = await connect(options.connection);
      const sandbox = await client.create({ ...create });
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
        context.signal?.throwIfAborted();
        if (networkPolicy) {
          await confirmDaytonaNetworkPolicy(sandbox, networkPolicy);
          context.signal?.throwIfAborted();
        }
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
      return { ...lease, liveInput: true, fileTransfers: fileBatches(lease) };
    },
  };
}

export type { EgressPolicy } from "../domain/egress.types.ts";

/** @deprecated Use {@link createDaytonaSandboxProvider}. */
export const daytonaSandboxProvider = createDaytonaSandboxProvider;
