import type { Sandbox } from "@vercel/sandbox";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cloudRoots } from "./cloud.constants.ts";
import { vercelCommand } from "./vercel-command.ts";
import { vercelFiles } from "./vercel-files.ts";
import type { VercelOptions } from "./vercel.types.ts";

export type { VercelOptions } from "./vercel.types.ts";

export function vercel(
  options: VercelOptions = {},
  connect: (config: VercelOptions["create"]) => Promise<Sandbox> = async (
    config,
  ) => (await import("@vercel/sandbox")).Sandbox.create(config),
): SandboxProvider {
  return {
    name: "vercel",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const sandbox = await connect({
        ...options.create,
        env: { ...options.create?.env, ...context.variables },
      });
      const root = options.root ?? cloudRoots.vercel;
      let closed = false;
      let releasing: Promise<void> | undefined;
      let unregister = () => {};
      const release = () =>
        (releasing ??= sandbox
          .stop()
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
      try {
        await sandbox.mkDir(root);
        home = (
          await (await sandbox.runCommand("printenv", ["HOME"])).stdout()
        ).trim();
        if (!home.startsWith("/"))
          throw new OutpostError(
            "provider",
            "Cloud sandbox returned an invalid home directory",
          );
      } catch (cause) {
        await release();
        throw cause;
      }
      return {
        root,
        home,
        invoke: vercelCommand({
          sandbox,
          root,
          options,
          context,
          isClosed: () => closed,
        }),
        ...vercelFiles(sandbox),
        release,
      };
    },
  };
}
