import type { ContainerPlanOptions } from "./container.types.ts";

export function containerPlan({
  config,
  engine,
  user,
  root,
  name,
  image,
  volumes,
  fileParents,
}: ContainerPlanOptions): string[] {
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
          config.user ? `keep-id:uid=${user.uid},gid=${user.gid}` : "keep-id",
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
    ...(config.groups ?? []).flatMap((group) => ["--group-add", String(group)]),
    ...(config.devices ?? []).flatMap((device) => ["--device", device]),
    ...(config.cpus ? ["--cpus", String(config.cpus)] : []),
    ...(config.memoryMb ? ["--memory", `${config.memoryMb}m`] : []),
    "--entrypoint",
    "sleep",
    image,
    "infinity",
  ];

  return args;
}
