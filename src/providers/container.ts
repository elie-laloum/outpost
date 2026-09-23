import { randomUUID } from "node:crypto";
import { mkdir, stat } from "node:fs/promises";
import { basename, dirname, posix } from "node:path";
import { OutpostError, invariant } from "../domain/errors.ts";
import type {
  Command,
  SandboxProvider,
  Variables,
  Volume,
} from "../domain/ports.ts";
import { expandPath } from "../infrastructure/files.ts";
import {
  executeProcess,
  quote,
  requireSuccess,
} from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";

export interface ContainerOptions {
  readonly image?: string;
  readonly user?: { readonly uid: number; readonly gid: number };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
}

export function imageName(repository: string): string {
  return `outpost:${
    basename(repository)
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "-") || "workspace"
  }`;
}

export function containerProvider(
  engine: "docker" | "podman",
  options: ContainerOptions = {},
  executor: Executor = executeProcess,
): SandboxProvider {
  const config = { ...options };
  if (config.cpus !== undefined)
    invariant(
      Number.isFinite(config.cpus) && config.cpus > 0,
      "cpus must be positive",
    );
  if (config.memoryMb !== undefined)
    invariant(
      Number.isSafeInteger(config.memoryMb) && config.memoryMb >= 64,
      "memoryMb must be at least 64",
    );
  return {
    name: engine,
    placement: "mounted",
    variables: { ...config.variables },
    async acquire(context) {
      const name = `outpost-${randomUUID()}`;
      const image = config.image ?? imageName(context.repository);
      const user = config.user ?? {
        uid: process.getuid?.() ?? 1000,
        gid: process.getgid?.() ?? 1000,
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
          { executable: engine, arguments: args, deadlineMs: 60_000, ...extra },
          executor,
        );
      const inspection = await call([
        "image",
        "inspect",
        "--format",
        "{{.Config.User}}",
        image,
      ]);
      const configuredUser = inspection.stdout.trim().split(":")[0];
      if (
        configuredUser &&
        /^\d+$/.test(configuredUser) &&
        Number(configuredUser) !== user.uid
      )
        throw new OutpostError(
          "provider",
          `Image UID ${configuredUser} does not match requested UID ${user.uid}`,
          { image, user },
        );
      const root = "/workspace",
        home = "/home/agent";
      const env: Record<string, string> = {
        ...context.variables,
        HOME: home,
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "safe.directory",
        GIT_CONFIG_VALUE_0: "*",
      };
      const internal: Volume[] = [{ source: context.directory, target: root }];
      if (context.gitDirectories.length) {
        internal.push({
          source: context.gitDirectories[0]!,
          target: "/outpost/git/worktree",
        });
        internal.push({
          source: context.gitDirectories.at(-1)!,
          target: "/outpost/git/common",
        });
        env.GIT_DIR = "/outpost/git/worktree";
        env.GIT_COMMON_DIR = "/outpost/git/common";
        env.GIT_WORK_TREE = root;
      }
      const volumes: string[] = [];
      for (const volume of [...internal, ...(config.volumes ?? [])]) {
        const source = expandPath(volume.source, context.repository);
        if (!(await stat(source).catch(() => undefined)))
          throw new OutpostError(
            "provider",
            `Mount source is unavailable: ${source}`,
          );
        const target = volume.target.startsWith("/")
          ? posix.normalize(volume.target)
          : posix.resolve(root, volume.target);
        invariant(
          !source.includes(",") && !target.includes(","),
          "Mount paths cannot contain commas",
        );
        if (config.label === false || process.platform !== "linux")
          volumes.push(
            "--mount",
            `type=bind,source=${source},target=${target}${volume.readOnly ? ",readonly" : ""}`,
          );
        else
          volumes.push(
            "--volume",
            `${source}:${target}:${volume.readOnly ? "ro," : ""}${config.label ?? "z"}`,
          );
      }
      const networks =
        typeof config.networks === "string"
          ? [config.networks]
          : (config.networks ?? []);
      const args = [
        "create",
        "--name",
        name,
        "--init",
        "--user",
        `${user.uid}:${user.gid}`,
        "--workdir",
        root,
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--tmpfs",
        `/home/agent:rw,uid=${user.uid},gid=${user.gid},mode=0700`,
        ...volumes,
        ...Object.keys(env).flatMap((key) => ["--env", key]),
        ...networks.flatMap((network) => ["--network", network]),
        ...(config.groups ?? []).flatMap((group) => [
          "--group-add",
          String(group),
        ]),
        ...(config.devices ?? []).flatMap((device) => ["--device", device]),
        ...(config.cpus ? ["--cpus", String(config.cpus)] : []),
        ...(config.memoryMb ? ["--memory", `${config.memoryMb}m`] : []),
        "--entrypoint",
        "sleep",
        image,
        "infinity",
      ];
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
          variables: env,
          ...(context.signal ? { signal: context.signal } : {}),
        });
        await call(
          ["start", name],
          context.signal ? { signal: context.signal } : {},
        );
        await call([
          "exec",
          name,
          "sh",
          "-c",
          "command -v setsid >/dev/null && command -v kill >/dev/null",
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
      unregister = registerCleanup(release);
      return {
        root,
        home,
        async invoke(command) {
          if (closed)
            throw new OutpostError("provider", "Container sandbox is closed");
          command.signal?.throwIfAborted();
          const id = randomUUID();
          const pidFile = `/tmp/outpost-${id}.pid`;
          const variables = { ...command.variables };
          invariant(
            Object.keys(variables).every((key) =>
              /^[A-Za-z_][A-Za-z0-9_]*$/.test(key),
            ),
            "Invalid environment key",
          );
          const flags = [
            "exec",
            command.interactive && process.stdin.isTTY ? "-it" : "-i",
            ...(command.elevated ? ["--user", "0:0"] : []),
            "--workdir",
            command.directory ?? root,
            ...Object.keys(variables).flatMap((key) => ["--env", key]),
            name,
          ];
          const wrapper = `echo $$ > ${quote(pidFile)}; test ! -f ${quote(pidFile + ".cancel")} || exit 130; exec "$@"`;
          const { directory: _directory, ...invocation } = command;
          let interrupted = false;
          try {
            return await executor({
              ...invocation,
              executable: engine,
              arguments: [
                ...flags,
                "setsid",
                ...(command.interactive ? ["--wait"] : []),
                "sh",
                "-c",
                wrapper,
                "outpost",
                command.executable,
                ...(command.arguments ?? []),
              ],
              variables,
              retain: command.retain ?? config.retain ?? 65_536,
            });
          } catch (cause) {
            interrupted = true;
            try {
              await call([
                "exec",
                name,
                "sh",
                "-c",
                `touch ${quote(pidFile + ".cancel")}; if [ -f ${quote(pidFile)} ]; then p=$(cat ${quote(pidFile)}); kill -TERM -"$p" 2>/dev/null || true; sleep 0.1; kill -KILL -"$p" 2>/dev/null || true; fi`,
              ]);
            } catch (cleanup) {
              throw new AggregateError(
                [cause, cleanup],
                "Command cancellation could not be confirmed",
              );
            }
            throw cause;
          } finally {
            if (!closed && !interrupted)
              await call(["exec", name, "rm", "-f", pidFile]).catch(
                () => undefined,
              );
          }
        },
        async upload(source, destination) {
          await call(["exec", name, "mkdir", "-p", posix.dirname(destination)]);
          await call(["cp", source, `${name}:${destination}`]);
        },
        async download(source, destination) {
          await mkdir(dirname(destination), { recursive: true });
          await call(["cp", `${name}:${source}`, destination]);
        },
        release,
      };
    },
  };
}
