import type { Daytona, DaytonaConfig } from "@daytona/sdk";
import { posix } from "node:path";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cloudRoots } from "./cloud.constants.ts";
import { daytonaCommand } from "./daytona-command.ts";
import { daytonaFiles } from "./daytona-files.ts";
import type { DaytonaOptions } from "./daytona.types.ts";

export type { DaytonaOptions } from "./daytona.types.ts";

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
      const home = (await sandbox.getUserHomeDir()) ?? cloudRoots.daytonaHome;
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
    },
  };
}
