import {
  prepareCloudCaches,
  validateCloudCaches,
  releaseCloudSandbox,
} from "./cloud-cache.ts";
import type { Sandbox } from "@vercel/sandbox";
import { invariant, OutpostError } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { fileBatches } from "./file-batches.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cloudRoots } from "./cloud.constants.ts";
import { vercelCommand } from "./vercel-command.ts";
import { vercelNetworkPolicy } from "./vercel-network.ts";
import { vercelDirectory } from "./vercel-directory.ts";
import { vercelFiles } from "./vercel-files.ts";
import type { VercelOptions } from "./vercel.types.ts";

export type { CloudDependencyCache } from "./cloud-cache.types.ts";

export type { VercelOptions } from "./vercel.types.ts";

export function createVercelSandboxProvider(
  options: VercelOptions = {},
  connect: (config: VercelOptions["create"]) => Promise<Sandbox> = async (
    config,
  ) => (await import("@vercel/sandbox")).Sandbox.create(config),
): SandboxProvider {
  invariant(
    options.repositoryMode === undefined ||
      options.repositoryMode === "isolated",
    "Vercel repositoryMode must be isolated",
  );
  const caches = (options.caches ?? []).map((cache) => ({ ...cache }));
  validateCloudCaches(caches);
  const networkPolicy = vercelNetworkPolicy(options);
  const create: NonNullable<VercelOptions["create"]> = { ...options.create };
  return {
    name: "vercel",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const sandbox = await connect({
        ...create,
        ...(networkPolicy === undefined
          ? {}
          : { networkPolicy: structuredClone(networkPolicy) }),
        env: { ...create.env, ...context.variables },
      });
      const root = options.root ?? cloudRoots.vercel;
      let closed = false;
      let releasing: Promise<void> | undefined;
      let saveCaches: () => Promise<void> = async () => {};
      let unregister = () => {};
      const release = () =>
        (releasing ??= releaseCloudSandbox(
          () => saveCaches(),
          async () => {
            await sandbox.stop();
            closed = true;
            unregister();
          },
        ).catch((error) => {
          if (!closed) releasing = undefined;
          throw error;
        }));
      unregister = registerCleanup(release);
      let home: string;
      try {
        await vercelDirectory(sandbox, root);
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
      const lease = {
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
      try {
        saveCaches = await prepareCloudCaches(
          lease,
          caches,
          context,
          JSON.stringify([
            "vercel",
            create.runtime ?? create.image ?? "vercel/sandbox/universal:latest",
            create.source ?? null,
          ]),
        );
      } catch (cause) {
        try {
          await release();
        } catch (cleanup) {
          throw new AggregateError(
            [cause, cleanup],
            "Cloud cache setup and cleanup failed",
          );
        }
        throw cause;
      }
      return { ...lease, liveInput: true, fileTransfers: fileBatches(lease) };
    },
  };
}

export type { EgressPolicy } from "../domain/egress.types.ts";
