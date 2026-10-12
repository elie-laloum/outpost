import { setTimeout } from "node:timers/promises";
import { invariant, OutpostError } from "../domain/errors.ts";
import {
  containerEgress,
  defaultEgressImage,
} from "./container-egress.constants.ts";
import { egressRuntime } from "./egress/egress.constants.ts";
import type {
  ContainerCall,
  ContainerEngine,
  ContainerOptions,
  ContainerUser,
} from "./container.types.ts";

export function containerUserNamespace(
  engine: ContainerEngine,
  config: ContainerOptions,
  user: ContainerUser,
): string[] {
  if (
    engine !== "podman" ||
    config.userns === false ||
    (process.getuid?.() === 0 && config.userns !== "keep-id")
  )
    return [];
  return [
    "--userns",
    config.user ? `keep-id:uid=${user.uid},gid=${user.gid}` : "keep-id",
  ];
}

export function createContainerEgress(
  call: ContainerCall,
  name: string,
  config: ContainerOptions,
  engine: ContainerEngine,
  user: ContainerUser,
) {
  const companion = `${name}-egress`;
  let attempted = false;
  return {
    name: companion,
    async start(signal?: AbortSignal): Promise<void> {
      invariant(
        config.egress?.mode === "allowlist",
        "Container egress requires an allowlist",
      );
      invariant(
        user.uid !== egressRuntime.uid,
        `UID ${egressRuntime.uid} is reserved for the egress proxy`,
      );
      const image = config.egressImage ?? defaultEgressImage;
      invariant(
        image,
        "The default Outpost egress image has not been published; build images/egress and set egressImage",
      );
      const extra = signal ? { signal } : {};
      attempted = true;
      await call(
        [
          "create",
          "--name",
          companion,
          "--network",
          "bridge",
          "--label",
          `${containerEgress.label}=${name}`,
          "--user",
          "0:0",
          ...containerUserNamespace(engine, config, user),
          "--cap-drop",
          "ALL",
          "--cap-add",
          "NET_ADMIN",
          "--cap-add",
          "SETUID",
          "--cap-add",
          "SETGID",
          "--security-opt",
          "no-new-privileges",
          "--read-only",
          "--tmpfs",
          "/run/outpost:rw,noexec,nosuid,size=1m,mode=0700",
          "--env",
          `OUTPOST_EGRESS_POLICY=${JSON.stringify(config.egress)}`,
          "--entrypoint",
          "node",
          image,
          containerEgress.entrypoint,
        ],
        extra,
      );
      await call(["start", companion], extra);
      const deadline = Date.now() + containerEgress.startupMs;
      while (true) {
        signal?.throwIfAborted();
        try {
          await call(
            [
              "exec",
              companion,
              "node",
              containerEgress.entrypoint,
              "health",
              String(egressRuntime.version),
            ],
            { ...extra, deadlineMs: 2_000 },
          );
          return;
        } catch (cause) {
          signal?.throwIfAborted();
          const running = await call(
            ["inspect", "--format", "{{.State.Running}}", companion],
            extra,
          );
          if (running.stdout.trim() !== "true" || Date.now() >= deadline)
            throw new OutpostError(
              "provider",
              "Container egress could not establish its firewall and proxy; sandbox execution refused",
              { engine },
              cause,
            );
          await setTimeout(containerEgress.pollMs, undefined, extra);
        }
      }
    },
    async release(): Promise<void> {
      if (!attempted) return;
      const found = await call([
        "container",
        "ls",
        "--all",
        "--filter",
        `name=^${companion}$`,
        "--format",
        "{{.Names}}",
      ]);
      if (!found.stdout.trim()) return;
      invariant(
        found.stdout.trim() === companion,
        "Egress container identity mismatch",
      );
      await call(["rm", "--force", companion]);
    },
  };
}
