import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import type { Command } from "../domain/command.types.ts";
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
  const config = {
    ...options,
    caches: (options.caches ?? []).map((cache) => ({ ...cache })),
  };
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
  return {
    name: engine,
    placement: config.repositoryMode === "isolated" ? "remote" : "mounted",
    variables: { ...config.variables },
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
      const caches = await cacheMounts(
        config.caches ?? [],
        context.repository,
        image,
        user,
      );
      for (const cache of caches)
        volumes.push("--volume", `${cache.volume}:${cache.target}:nocopy`);
      const args = containerPlan({
        config,
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
      let unregister = () => {};
      const release = (): Promise<void> => {
        closed = true;
        releasing ??= call(["rm", "--force", name])
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
        if (fileParents.size)
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
              `mkdir -p ${quote(root)} && chmod 700 ${quote(root)} /outpost && chown ${user.uid}:${user.gid} ${quote(root)} /outpost`,
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
        if (!closed)
          execFileSync(engine, ["rm", "--force", name], {
            timeout: containerDefaults.cleanupMs,
            stdio: "ignore",
            windowsHide: true,
          });
      });
      return {
        root,
        home,
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
}
