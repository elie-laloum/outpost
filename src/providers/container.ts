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
  const config = { ...options };
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
    placement: "mounted",
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
      const root = containerDefaults.root,
        home = containerDefaults.home;
      const { env, volumes, fileParents } = await containerMounts(
        context,
        config,
        platform,
        root,
        home,
      );
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
        await call(args, {
          ...(context.signal ? { signal: context.signal } : {}),
        });
        await call(
          ["start", name],
          context.signal ? { signal: context.signal } : {},
        );
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
