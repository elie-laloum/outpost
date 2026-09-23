import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, posix, relative } from "node:path";
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
  readonly userns?: "keep-id" | false;
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
      Number.isSafeInteger(config.memoryMb) && config.memoryMb >= 64,
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
      if (engine === "podman" && platform === "darwin") {
        const machines = await call(["machine", "list", "--format", "json"]);
        const entries: unknown = JSON.parse(machines.stdout);
        invariant(
          Array.isArray(entries) &&
            entries.some(
              (machine) =>
                machine.Running === true || machine.State === "running",
            ),
          "Start a Podman machine with podman machine start before creating a sandbox",
        );
      }
      const inspection = await call([
        "image",
        "inspect",
        "--format",
        "{{.Config.User}}",
        image,
      ]);
      const configuredUser = inspection.stdout.trim().split(":")[0];
      if (
        !config.user &&
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
        const common = context.gitDirectories.at(-1)!;
        const offset = relative(common, context.gitDirectories[0]!);
        const nested =
          !isAbsolute(offset) &&
          offset !== ".." &&
          !offset.startsWith("..\\") &&
          !offset.startsWith("../");
        internal.push({
          source: common,
          target: "/outpost/git/common",
        });
        if (!nested)
          internal.push({
            source: context.gitDirectories[0]!,
            target: "/outpost/git/worktree",
          });
        env.GIT_DIR = nested
          ? posix.join("/outpost/git/common", offset.replaceAll("\\", "/"))
          : "/outpost/git/worktree";
        env.GIT_COMMON_DIR = "/outpost/git/common";
        env.GIT_WORK_TREE = root;
      }
      const volumes: string[] = [];
      const fileParents = new Set<string>();
      for (const volume of [...internal, ...(config.volumes ?? [])]) {
        const source = expandPath(volume.source, context.repository);
        const info = await stat(source).catch(() => undefined);
        if (!info)
          throw new OutpostError(
            "provider",
            `Mount source is unavailable: ${source}`,
          );
        const destination = volume.target.replaceAll("\\", "/");
        const target =
          destination === "~"
            ? home
            : destination.startsWith("~/")
              ? posix.resolve(home, destination.slice(2))
              : posix.resolve(root, destination);
        if (info.isFile() && !internal.includes(volume)) {
          const parent = posix.dirname(target);
          invariant(
            parent === home || parent.startsWith(home + "/"),
            "File mounts must live inside the agent home; mount the containing directory for other destinations",
          );
          for (
            let folder = parent;
            folder !== home;
            folder = posix.dirname(folder)
          )
            fileParents.add(folder);
        }
        invariant(
          !source.includes(",") && !target.includes(","),
          "Mount paths cannot contain commas",
        );
        if (config.label === false || platform !== "linux")
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
        ...(engine === "podman" &&
        config.userns !== false &&
        (process.getuid?.() !== 0 || config.userns === "keep-id")
          ? [
              "--userns",
              config.user
                ? `keep-id:uid=${user.uid},gid=${user.gid}`
                : "keep-id",
            ]
          : []),
        "--workdir",
        root,
        "--cap-drop",
        "ALL",
        ...(fileParents.size ? ["--cap-add", "CHOWN"] : []),
        "--security-opt",
        "no-new-privileges",
        "--tmpfs",
        engine === "podman"
          ? "/home/agent:rw,mode=1777"
          : `/home/agent:rw,uid=${fileParents.size ? 0 : user.uid},gid=${fileParents.size ? 0 : user.gid},mode=0700`,
        ...volumes,
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
      unregister = registerCleanup(release, () => {
        if (!closed)
          execFileSync(engine, ["rm", "--force", name], {
            timeout: 10_000,
            stdio: "ignore",
            windowsHide: true,
          });
      });
      return {
        root,
        home,
        async invoke(command) {
          if (closed)
            throw new OutpostError("provider", "Container sandbox is closed");
          command.signal?.throwIfAborted();
          const id = randomUUID();
          const pidFile = `/tmp/outpost-${id}.pid`;
          const variables = { ...env, ...command.variables };
          invariant(
            Object.keys(variables).every((key) =>
              /^[A-Za-z_][A-Za-z0-9_]*$/.test(key),
            ),
            "Invalid environment key",
          );
          const environment = Object.fromEntries(
            Object.entries(variables).map(([key, value], index) => [
              `OUTPOST_VALUE_${index}`,
              value,
            ]),
          );
          const exports = Object.keys(variables)
            .map(
              (key, index) =>
                `export ${key}="$OUTPOST_VALUE_${index}"; unset OUTPOST_VALUE_${index};`,
            )
            .join(" ");
          const flags = [
            "exec",
            command.interactive && process.stdin.isTTY ? "-it" : "-i",
            ...(command.elevated ? ["--user", "0:0"] : []),
            "--workdir",
            command.directory ?? root,
            ...Object.keys(environment).flatMap((key) => ["--env", key]),
            name,
          ];
          const wrapper = `${exports} echo $$ > ${quote(pidFile)}; test ! -f ${quote(pidFile + ".cancel")} || exit 130; exec "$@"`;
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
                ...(command.interactive && process.stdin.isTTY
                  ? ["--ctty"]
                  : []),
                "sh",
                "-c",
                wrapper,
                "outpost",
                command.executable,
                ...(command.arguments ?? []),
              ],
              variables: environment,
              retain: command.retain ?? config.retain ?? 65_536,
            });
          } catch (cause) {
            interrupted = true;
            try {
              await call([
                "exec",
                ...(command.elevated ? ["--user", "0:0"] : []),
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
        async upload(source, destination, options = {}) {
          options.signal?.throwIfAborted();
          await call(
            ["exec", name, "mkdir", "-p", posix.dirname(destination)],
            options,
          );
          await call(["cp", source, `${name}:${destination}`], options);
        },
        async download(source, destination, options = {}) {
          options.signal?.throwIfAborted();
          await mkdir(dirname(destination), { recursive: true });
          await call(["cp", `${name}:${source}`, destination], options);
        },
        release,
      };
    },
  };
}
