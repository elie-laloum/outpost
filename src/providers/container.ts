import { validateContainerImage } from "../domain/container-image.ts";
import { recoverContainer } from "./container-recovery.ts";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import type { Command } from "../domain/command.types.ts";
import { containerNetworks } from "./container-network.ts";
import { validateEgress } from "../domain/egress.ts";
import { createContainerEgress } from "./container-egress.ts";
import { egressVariables } from "./egress/egress.constants.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import {
  executeProcess,
  quote,
  requireSuccess,
} from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { cacheMounts, validateCaches } from "./container-cache.ts";
import {
  cacheCreateOptions,
  cacheDefaults,
} from "./container-cache.constants.ts";
import { containerCommand } from "./container-command.ts";
import { containerFiles } from "./container-files.ts";
import { containerMounts } from "./container-mounts.ts";
import { containerPlan } from "./container-plan.ts";
import { containerPreflight } from "./container-preflight.ts";
import { containerDefaults } from "./container.constants.ts";
import type { ContainerEngine, ContainerOptions } from "./container.types.ts";
import { containerSandboxCapabilities } from "./sandbox-capabilities.ts";
import { fileProviderContext } from "./workspace-context.ts";

export type { ContainerOptions } from "./container.types.ts";

export function imageName(repository: string): string {
  return `outpost:${
    basename(repository)
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "-") || "workspace"
  }`;
}

export function containerProvider(
  engine: ContainerEngine,
  options: ContainerOptions = {},
  executor: Executor = executeProcess,
  platform: NodeJS.Platform = process.platform,
): SandboxProvider {
  if (options.image !== undefined) validateContainerImage(options.image);
  const policy = validateEgress(options.egress);
  const config = {
    ...options,
    ...(policy ? { egress: policy } : {}),
    networks: containerNetworks(options),
    caches: (options.caches ?? []).map((cache) => ({ ...cache })),
  };
  if (config.egressImage !== undefined) {
    invariant(
      config.egress?.mode === "allowlist",
      "egressImage requires an egress allowlist",
    );
    invariant(
      typeof config.egressImage === "string" &&
        config.egressImage.length > 0 &&
        !config.egressImage.startsWith("-") &&
        !/\s/.test(config.egressImage),
      "Invalid egressImage reference",
    );
  }
  invariant(
    config.repositoryMode === undefined ||
      config.repositoryMode === "mounted" ||
      config.repositoryMode === "isolated",
    "repositoryMode must be mounted or isolated",
  );
  validateCaches(config);
  if (config.cpus !== undefined)
    invariant(
      Number.isFinite(config.cpus) && config.cpus > 0,
      "cpus must be positive",
    );
  if (config.memoryMb !== undefined)
    invariant(
      Number.isSafeInteger(config.memoryMb) &&
        config.memoryMb >= containerDefaults.minimumMemoryMb,
      "memoryMb must be at least 64",
    );
  const capabilities = containerSandboxCapabilities(config);
  const provider: SandboxProvider = {
    name: engine,
    placement: capabilities.placement,
    variables: { ...config.variables },
    ...(config.repositoryMode !== "isolated"
      ? {
          recover: (resourceId, recoveryOptions) =>
            recoverContainer(engine, executor, resourceId, recoveryOptions),
        }
      : {}),
    async acquire(context) {
      context.signal?.throwIfAborted();
      const name = `outpost-${randomUUID()}`;
      const image = config.image ?? imageName(context.repository);
      const user = config.user ?? {
        uid: process.getuid?.() ?? containerDefaults.uid,
        gid: process.getgid?.() ?? containerDefaults.gid,
      };
      invariant(
        Number.isInteger(user.uid) &&
          user.uid >= 0 &&
          Number.isInteger(user.gid) &&
          user.gid >= 0,
        "Invalid container user",
      );
      const call = (args: readonly string[], extra: Partial<Command> = {}) =>
        requireSuccess(
          {
            executable: engine,
            arguments: args,
            deadlineMs: containerDefaults.deadlineMs,
            ...extra,
          },
          executor,
        );
      await containerPreflight(engine, platform, call, config, image, user);
      const root =
          config.repositoryMode === "isolated"
            ? containerDefaults.isolatedRoot
            : containerDefaults.root,
        home = containerDefaults.home;
      const { env, volumes, fileParents } = await containerMounts(
        context,
        config,
        platform,
        root,
        home,
      );
      const egress =
        config.egress?.mode === "allowlist"
          ? createContainerEgress(call, name, config, engine, user)
          : undefined;
      if (egress) Object.assign(env, egressVariables);
      const caches = await cacheMounts(
        config.caches ?? [],
        context.repository,
        image,
        user,
        context.workspaceIdentity,
      );
      for (const cache of caches)
        volumes.push("--volume", `${cache.volume}:${cache.target}:nocopy`);
      const args = containerPlan({
        config: egress
          ? { ...config, networks: [`container:${egress.name}`] }
          : config,
        engine,
        user,
        root,
        name,
        image,
        volumes,
        fileParents,
      });
      let closed = false,
        releasing: Promise<void> | undefined;
      let attempted = false;
      let unregister = () => {};
      const release = (): Promise<void> => {
        closed = true;
        releasing ??= (async () => {
          if (attempted) {
            await call(["rm", "--force", name]);
            attempted = false;
          }
          await egress?.release();
        })()
          .then(() => {
            unregister();
          })
          .catch((error) => {
            releasing = undefined;
            throw error;
          });
        return releasing;
      };
      try {
        for (const cache of caches)
          await call(
            [
              "volume",
              "create",
              ...cacheCreateOptions[engine],
              "--label",
              `${cacheDefaults.label}=true`,
              cache.volume,
            ],
            context.signal ? { signal: context.signal } : {},
          );
        await context.registerRecovery?.(name);
        context.signal?.throwIfAborted();
        await egress?.start(context.signal);
        attempted = true;
        await call(args, {
          ...(context.signal ? { signal: context.signal } : {}),
        });
        await call(
          ["start", name],
          context.signal ? { signal: context.signal } : {},
        );
        for (const cache of caches) {
          await call(
            [
              "exec",
              "--user",
              "0:0",
              name,
              "chown",
              `${user.uid}:${user.gid}`,
              cache.target,
            ],
            context.signal ? { signal: context.signal } : {},
          );
          await call(
            ["exec", name, "chmod", "700", cache.target],
            context.signal ? { signal: context.signal } : {},
          );
        }
        for (const parent of fileParents)
          await call([
            "exec",
            "--user",
            "0:0",
            name,
            "sh",
            "-c",
            `mkdir -p ${quote(parent)} && chown ${user.uid}:${user.gid} ${quote(parent)}`,
          ]);
        if (engine === "podman" || fileParents.size)
          await call([
            "exec",
            "--user",
            "0:0",
            name,
            "chown",
            `${user.uid}:${user.gid}`,
            home,
          ]);
        if (config.repositoryMode === "isolated")
          await call(
            [
              "exec",
              "--user",
              "0:0",
              name,
              "sh",
              "-c",
              `mkdir -p ${quote(root)} && chmod 700 ${quote(root)} /tmp/outpost && chown ${user.uid}:${user.gid} ${quote(root)} /tmp/outpost`,
            ],
            context.signal ? { signal: context.signal } : {},
          );
        await call([
          "exec",
          name,
          "sh",
          "-c",
          "command -v setsid >/dev/null && command -v kill >/dev/null && command -v tar >/dev/null && command -v cp >/dev/null",
        ]);
      } catch (cause) {
        try {
          await release();
        } catch (cleanup) {
          throw new AggregateError(
            [cause, cleanup],
            "Sandbox provisioning and cleanup failed",
          );
        }
        throw cause;
      }
      unregister = registerCleanup(release, () => {
        if (attempted)
          execFileSync(
            engine,
            ["rm", "--force", name, ...(egress ? [egress.name] : [])],
            {
              timeout: containerDefaults.cleanupMs,
              stdio: "ignore",
              windowsHide: true,
            },
          );
      });
      return {
        root,
        home,
        liveInput: true,
        invoke: containerCommand({
          engine,
          config,
          executor,
          root,
          name,
          env,
          call,
          isClosed: () => closed,
        }),
        ...containerFiles({
          engine,
          config,
          executor,
          root,
          name,
          env,
          call,
          isClosed: () => closed,
        }),
        release,
      };
    },
  };
  return {
    ...provider,
    workspaces: {
      bindings: capabilities.bindings,
      async acquire(context) {
        invariant(
          config.image,
          "File workspaces require an explicit container image",
        );
        const source = context.workspace.source;
        const volumes = [...(config.volumes ?? [])];
        if (source.kind === "directory" && source.access.mode === "mount") {
          invariant(
            config.repositoryMode !== "isolated",
            "Isolated containers cannot mount workspace sources",
          );
          volumes.push({
            source: source.directory,
            target: source.access.target,
            readOnly: source.access.readOnly,
          });
        }
        const selected = containerProvider(
          engine,
          { ...config, volumes },
          executor,
          platform,
        );
        return selected.acquire(fileProviderContext(context));
      },
    },
  };
}
